const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Sale, SaleItem, Product, User, sequelize } = require('../models');

// @route   GET api/sales
// @desc    Get all sales
// @access  Private
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'name']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'barcode']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sales/:id
// @desc    Get sale by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'name']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });
    
    if (!sale) {
      return res.status(404).json({ msg: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/sales
// @desc    Create a new sale (checkout)
// @access  Private
router.post('/', [
  check('items', 'Items are required').isArray({ min: 1 }),
  check('items.*.productId', 'Product ID is required for each item').not().isEmpty(),
  check('items.*.quantity', 'Quantity is required for each item').isInt({ min: 1 }),
  check('paymentMethod', 'Payment method is required').isIn(['cash', 'credit_card', 'debit_card'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    items, 
    paymentMethod, 
    userId, 
    installments, 
    cardLastDigits,
    couponCode
  } = req.body;

  const t = await sequelize.transaction();

  try {
    // Calculate total and process items
    let totalAmount = 0;
    let discountApplied = 0;
    const processedItems = [];

    // Process each item in the sale
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({ msg: `Product with ID ${item.productId} not found` });
      }

      // Check if there's enough stock
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          msg: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Calculate price (considering discounts)
      const priceToUse = product.isDiscounted ? product.discountedPrice : product.price;
      const itemSubtotal = priceToUse * item.quantity;
      
      // Apply item-specific discount if provided
      const itemDiscount = item.discountAmount || 0;
      
      // Update total
      totalAmount += itemSubtotal - itemDiscount;
      discountApplied += itemDiscount;

      // Prepare item for database
      processedItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtSale: priceToUse,
        discountApplied: itemDiscount
      });

      // Update stock
      await product.update({
        stock: product.stock - item.quantity
      }, { transaction: t });
    }

    // Apply coupon discount if provided
    if (couponCode) {
      // Here you would validate the coupon and calculate additional discount
      // For now, we'll just record the coupon code
    }

    // Create the sale record
    const sale = await Sale.create({
      totalAmount,
      paymentMethod,
      userId: userId || null, // If no user is specified (guest checkout)
      installments: installments || 1,
      cardLastDigits: cardLastDigits || null,
      discountApplied,
      couponCode,
      paymentStatus: 'completed', // Assuming payment is processed immediately
      saleDate: new Date()
    }, { transaction: t });

    // Create sale items
    for (const item of processedItems) {
      await SaleItem.create({
        ...item,
        saleId: sale.id
      }, { transaction: t });
    }

    await t.commit();

    // Fetch the complete sale with items to return
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    res.status(201).json(completeSale);
  } catch (err) {
    await t.rollback();
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/sales/:id/status
// @desc    Update sale payment status
// @access  Private
router.put('/:id/status', [
  check('paymentStatus', 'Payment status is required').isIn(['pending', 'completed', 'cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { paymentStatus } = req.body;

  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ msg: 'Sale not found' });
    }

    // If cancelling a completed sale, restore stock
    if (paymentStatus === 'cancelled' && sale.paymentStatus === 'completed') {
      const t = await sequelize.transaction();
      
      try {
        // Get all items in this sale
        const saleItems = await SaleItem.findAll({
          where: { saleId: sale.id },
          transaction: t
        });

        // Restore stock for each item
        for (const item of saleItems) {
          await Product.increment('stock', {
            by: item.quantity,
            where: { id: item.productId },
            transaction: t
          });
        }

        // Update sale status
        await sale.update({ paymentStatus }, { transaction: t });
        
        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } else {
      // Just update the status
      await sale.update({ paymentStatus });
    }

    res.json(sale);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sales/report/daily
// @desc    Get daily sales report
// @access  Private
router.get('/report/daily', async (req, res) => {
  try {
    const { date } = req.query;
    let targetDate = date ? new Date(date) : new Date();
    
    // Set time to beginning of the day
    targetDate.setHours(0, 0, 0, 0);
    
    // Set time to end of the day for comparison
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const sales = await Sale.findAll({
      where: {
        saleDate: {
          [sequelize.Op.between]: [targetDate, endDate]
        },
        paymentStatus: 'completed'
      },
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    // Calculate totals
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const totalItems = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Group by payment method
    const paymentMethods = {};
    sales.forEach(sale => {
      if (!paymentMethods[sale.paymentMethod]) {
        paymentMethods[sale.paymentMethod] = 0;
      }
      paymentMethods[sale.paymentMethod] += parseFloat(sale.totalAmount);
    });

    res.json({
      date: targetDate.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      totalItems,
      paymentMethods,
      sales
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;