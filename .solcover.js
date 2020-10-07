module.exports = {
  client: require('ganache-core'),
  providerOptions: {
    mnemonic: 'fetch local valve black attend double eye excite planet primary install allow',
  },
  skipFiles: ['Migrations.sol', 'Token.sol', 'oz', 'gnosis-safe'],
};
