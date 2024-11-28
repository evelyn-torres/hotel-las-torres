import {ObjectId} from 'mongodb';

const exportedMethods = {
  checkId(id) {
    if (!id) throw 'Error: You must provide an id to search for';
    if (typeof id !== 'string') throw 'Error: id must be a string';
    id = id.trim();
    if (id.length === 0)
      throw 'Error: id cannot be an empty string or just spaces';
    if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string instead of ${typeof strVal}!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: Input cannot be just digits${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkLoginInput(strVal, varName){
    if (!strVal) throw `Input Error: You must supply a ${varName}!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Input Error: ${varName} cannot be an empty or just spaces`;
    if (varName == "username" && !isNaN(strVal))
      throw `Input Error: ${varName} must inlcude combination of letters and numbers`;
    return strVal;
  }
};

export default exportedMethods;
