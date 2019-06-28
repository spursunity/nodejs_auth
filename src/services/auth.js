const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const clientData = require('../client/client');

class AuthService {
  constructor() {
    this.secret = 'abracadabra';
    this.client = clientData();
    this.db;
  }

  async connectDb() {
    const connection = await this.client.connect();
    this.db = connection.db();
  }

  async signup(uName, pass) {
    try {
      const saltRounds = 10;
      const passHash = await bcrypt.hash(pass, saltRounds);
      const uData = {
        username: uName,
        password: passHash,
      };
      const status = await this.db.collection('users').insertOne(uData);

      return status.result.ok;
    } catch (err) {
      console.log(err);
    }
  }

  async login(uName, pass) {
    try {
      const uData = await this.db.collection('users').findOne({ username: uName });
      const passHash = uData.password;
      const status = await bcrypt.compare(pass, passHash);

      return !!status;
    } catch (err) {
      console.log(err);
    }
  }

  async getToken(uName) {
    try {
      const uData = await this.db.collection('users').findOne({ username: uName });
      const { username, _id } = uData;
      const { secret } = this;

      return jwt.sign({ username, _id }, secret);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = AuthService;
