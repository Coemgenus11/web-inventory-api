const { body, validationResult } = require('express-validator');

const rules = [
  body('name').isString().isLength({ min: 2 }).withMessage('Name kailangan at least 2 chars'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category_id kailangan'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit Price bawal negative'),
  body('retail_price').isFloat({ min: 0 }).withMessage('Retail Price bawal negative'),
  body('stock').isInt({ min: 0 }).withMessage('Stock bawal negative')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

module.exports = { rules, validate };