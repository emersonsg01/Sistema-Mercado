module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'credit_card', 'debit_card'),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    installments: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    cardLastDigits: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    discountApplied: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    saleDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  Sale.associate = (models) => {
    // Sale belongs to a User (cashier)
    Sale.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'cashier'
    });

    // Sale has many SaleItems
    Sale.hasMany(models.SaleItem, {
      foreignKey: 'saleId',
      as: 'items',
      onDelete: 'CASCADE'
    });
  };

  return Sale;
};