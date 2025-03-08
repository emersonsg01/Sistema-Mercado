const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Product } = require('../models');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/barcode/:code
// @desc    Get product by barcode
// @access  Public
router.get('/barcode/:code', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { barcode: req.params.code }
    });
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('barcode', 'Barcode is required').not().isEmpty(),
  check('price', 'Price is required and must be a number').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    name, 
    barcode, 
    description, 
    price, 
    stock, 
    expirationDate, 
    category,
    isDiscounted,
    discountPercentage 
  } = req.body;

  try {
    // Check if product with barcode already exists
    let product = await Product.findOne({ where: { barcode } });
    
    if (product) {
      return res.status(400).json({ msg: 'Product with this barcode already exists' });
    }

    // Create new product
    product = await Product.create({
      name,
      barcode,
      description,
      price,
      stock: stock || 0,
      expirationDate,
      category,
      isDiscounted: isDiscounted || false,
      discountPercentage
    });

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', async (req, res) => {
  const { 
    name, 
    barcode, 
    description, 
    price, 
    stock, 
    expirationDate, 
    category,
    isDiscounted,
    discountPercentage 
  } = req.body;

  // Build product object
  const productFields = {};
  if (name) productFields.name = name;
  if (barcode) productFields.barcode = barcode;
  if (description !== undefined) productFields.description = description;
  if (price) productFields.price = price;
  if (stock !== undefined) productFields.stock = stock;
  if (expirationDate) productFields.expirationDate = expirationDate;
  if (category) productFields.category = category;
  if (isDiscounted !== undefined) productFields.isDiscounted = isDiscounted;
  if (discountPercentage !== undefined) productFields.discountPercentage = discountPercentage;

  try {
    let product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Update product
    await product.update(productFields);
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await product.destroy();
    
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/products/:id/stock
// @desc    Update product stock
// @access  Private
router.put('/:id/stock', [
  check('quantity', 'Quantity is required and must be a number').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { quantity, operation } = req.body;

  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Update stock based on operation (add or subtract)
    if (operation === 'add') {
      product.stock += parseInt(quantity);
    } else if (operation === 'subtract') {
      if (product.stock < quantity) {
        return res.status(400).json({ msg: 'Insufficient stock' });
      }
      product.stock -= parseInt(quantity);
    } else {
      // If no operation specified, just set the stock to the quantity
      product.stock = parseInt(quantity);
    }

    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/products/:id/discount
// @desc    Apply or remove discount to a product
// @access  Private
router.put('/:id/discount', [
  check('isDiscounted', 'isDiscounted field is required').isBoolean(),
  check('discountPercentage', 'discountPercentage must be a number between 0 and 100')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { isDiscounted, discountPercentage } = req.body;

  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Update discount information
    product.isDiscounted = isDiscounted;
    if (isDiscounted && discountPercentage !== undefined) {
      product.discountPercentage = discountPercentage;
    } else if (!isDiscounted) {
      product.discountPercentage = null;
    }

    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;