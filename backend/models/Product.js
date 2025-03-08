module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDiscounted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    discountedPrice: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.isDiscounted && this.discountPercentage) {
          const discount = (this.price * this.discountPercentage) / 100;
          return parseFloat((this.price - discount).toFixed(2));
        }
        return this.price;
      }
    }
  }, {
    timestamps: true
  });

  Product.associate = (models) => {
    // Product can be part of many sales through SaleItem
    Product.hasMany(models.SaleItem, {
      foreignKey: 'productId',
      as: 'saleItems'
    });
  };

  return Product;
};