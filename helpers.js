import {ObjectId} from 'mongodb';

const exportedMethods = { 
  checkId(id, varName){
    if (!id) throw `Error: You must provide an ${varName} to search for`;
    if (typeof id !== 'string') throw `Error: ${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
    return id;
  },

  checkString(strVal, varName){
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkGovId(strVal, varName){
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
   
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
  },

  checkDate(dateStr, varName) {
    if (!dateStr) throw `Error: You must supply a ${varName}!`;
    if (typeof dateStr !== "string") throw `Error: ${varName} must be a string!`;
    dateStr = dateStr.trim();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw `Error: ${varName} is not a valid date format!`;
    return dateStr;
  }
};

export default exportedMethods;

