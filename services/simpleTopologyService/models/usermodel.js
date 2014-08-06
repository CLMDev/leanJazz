/**
*  Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/leanJazz',
  function(err) {
    if (!err) {
      console.log('mongoose connected');
    }else {
      console.log('mongoose already connected');
    }
});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var UserSchema = new Schema({
    _id: {type: ObjectId, auto: true},
	_salt: {type: ObjectId, auto: true},
	mail: {type: String, unique: true},
	userName: {type: String},
	passwordHash:{type: String},
	isRegistered: {type: Boolean, default: false },	
	isActive: {type: Boolean, default: true },	
	},{strict: 'throw'}
);

var mUser = mongoose.model('mUser', UserSchema);
module.exports = mUser;


