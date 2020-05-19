const Logger = function() {};

Logger.prototype.info = function(msgStringText, value) {
  console.log(`${new Date().toLocaleString()} INFO: ${msgStringText}:${JSON.stringify(value)}`);
};

Logger.prototype.debug = function(msgStringText, value) {
  console.log(`${new Date()} DEBUG::::::: ${msgStringText} :: ${value}`);
};

Logger.prototype.error = function(msgStringText, value) {
  console.log(`${new Date()} ERROR::::::: ${msgStringText} :: ${value}`);
};

module.exports = new Logger();
