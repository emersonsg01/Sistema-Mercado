module.exports = (sequelize, DataTypes) => {
  const SaleItem = sequelize.define('SaleItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    priceAtSale: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price of the product at the time of sale'
    },
    discountApplied: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Discount amount applied to this specific item'
    },
    subtotal: {
      type: DataTypes.VIRTUAL,
      get() {
        const baseAmount = this.priceAtSale * this.quantity;
        return parseFloat((baseAmount - this.discountApplied).toFixed(2));
      }
    }
  }, {
    timestamps: true
  });

  SaleItem.associate = (models) => {
    // SaleItem belongs to a Sale
    SaleItem.belongsTo(models.Sale, {
      foreignKey: 'saleId',
      as: 'sale'
    });

    // SaleItem belongs to a Product
    SaleItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return SaleItem;
};