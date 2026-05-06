const service = require('../services/authService');

const register = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    const user = await service.register({ username, password, full_name, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// const me = async (req, res) => {
//   res.json(req.user); // galing sa middleware
// };

const me = async (req, res) => {
  try {
    const user = await service.getUserById(req.user.id); // kukunin sa DB
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const list = async (req, res) => {
  const users = await service.getAllUsers();
  res.json(users);
};

const updatePassword = async (req, res) => {
  try {
    const result = await service.updatePassword({
      id: req.params.id,
      newPassword: req.body.password,
      requester: req.user
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports = { register, login, me, list, updatePassword };