import {admins} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';

// Function to get an admin by ID
export const getAdminById = async (id) => {
  id = validation.checkId(id, "admin id")
  const adminCollection = await admins();
  const admin = await adminCollection.findOne({_id: new ObjectId(id)});
  if (admin === null) throw 'No admin with that id';
  admin._id = admin._id.toString();
  return admin;
};

export const getAllAdmin = async () => {
  const adminCollection = await admins();
  return adminCollection.find({}).toArray();
};

export const grabAdminByLogin = async(user,pass) => {
  //error-checking
  user = validation.checkLoginInput(user, "username");
  pass = validation.checkLoginInput(pass, "password");
  
  //function
  const adminColl = await admins();
  const foundAdmin = await adminColl.findOne({userName: user, password: pass});
  if (foundAdmin == null) {
    throw "Error: No Admin w/ given UserName + Password";
  }

  return foundAdmin;
};

// Function to create a new admin
export const createAdmin = async (
  employeeFirstName,
  employeeLastName,
  govID,
  userName,
  password
) => {
  // Validate inputs
  if (!employeeFirstName) {
    throw ("error: You must provide a first name for the employee")};
  employeeFirstName = validation.checkString(employeeFirstName, "Employee First Name");

  if (!employeeLastName) {
    throw ("Error: You must provide a last name for the employee")}
  employeeLastName = validation.checkString(employeeLastName, "Employee Last Name");

  if (!govID){ 
    throw("Error: You must provide a government ID for the employee");
}
  govID = validation.checkString(govID, "Government ID");

  if (!userName){
    throw ("Error: You must provide a username")};
  userName = validation.checkString(userName, "Username");

  if (!password){ 
    throw ("Error: You must provide a password")};
  password = validation.checkString(password, "Password");

  // Get admin collection
  const adminCollection = await admins();

  // Create new admin object
  let newAdmin = {
    employeeFirstName: employeeFirstName,
    employeeLastName: employeeLastName,
    govID: govID,
    userName: userName,
    password: password,
  };

  // Insert new admin into collection
  const insertInfo = await adminCollection.insertOne(newAdmin);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Error: Could not add employee";
  }

  // Retrieve and return the newly created admin
  console.log()
  const newId = insertInfo.insertedId.toString();
  const createdAdmin = await getAdminById(newId);
  return createdAdmin;
};

//console.log(await grabAdminByLogin("wnabo","nabo_password1"));