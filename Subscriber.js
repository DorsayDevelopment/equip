const Document = require('camo').Document;

class Subscriber extends Document {
  constructor() {
    super();

    this.email = String;
    this.date = Date
  }

  static collectionName() {
    return 'subscribers';
  }
}

module.exports = Subscriber;