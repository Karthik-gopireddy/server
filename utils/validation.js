export const adminRegister = (admin) => {
  const errorArray = [];
  const { adminName, email, password, role } = admin;

  if (!adminName) {
    errorArray.push("admin name is required");
  }
  if (!email) {
    errorArray.push("Email is required");
  }
  if (!password) {
    errorArray.push("Password is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArrays: errorArray };
  } else {
    return { errorArray: false, errors: [] };
  }
};

export const adminLogin = (admin) => {
  const errorArray = [];
  const { email, password } = admin;
  if (!email) {
    errorArray.push("Email is required");
  }
  if (!password) {
    errorArray.push("Password is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArrays: errorArray };
  } else {
    return { errorArray: false, errorArrays: [] };
  }
};

export const vendorRegister = (vendor) => {
  const errorArray = [];
  const { vendor_name, email, password,mobile, role } = vendor;

  if (!vendor_name) {
    errorArray.push("vendor name is required");
  }
   if (!mobile) {
    errorArray.push("Mobile Number is required");
  }
  
  if (!email) {
    errorArray.push("Email is required");
  }
  if (!password) {
    errorArray.push("Password is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArrays: errorArray };
  } else {
    return { errorArray: false, errors: [] };
  }
};

export const vendorLogin = (vendor) => {
  const errorArray = [];
  const { email, password } = vendor;
  if (!email) {
    errorArray.push("Email is required");
  }
  if (!password) {
    errorArray.push("Password is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArrays: errorArray };
  } else {
    return { errorArray: false, errorArrays: [] };
  }
};

export const createProductValidation = (product) => {
  const errorArray = [];

  const { name, email, phone, address, price, image, category } = product;

  if (!name) {
    errorArray.push("Product name is required");
  }
  if (!category) {
    errorArray.push("Category is required");
  }

  if (!email) {
    errorArray.push("Email is required");
  }

  if (!phone) {
    errorArray.push("phone Number is required");
  }

  if (!address) {
    errorArray.push("address is required");
  }

  if (!price) {
    errorArray.push("Product price is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArray: errorArray };
  } else {
    return { errorArray: false, errorArray: [] };
  }
};

export const userValidation = (user) => {
  const errorArray = [];

  const { userName, email, password,mobile } = user;
  if (!userName) {
    errorArray.push("User name is required");
  }
    if (!mobile) {
    errorArray.push("Mobile number is required");
  }
  if (!email) {
    errorArray.push("Email is required");
  }
  if (!password) {
    errorArray.push("Password is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArrays: errorArray };
  } else {
    return { errorArray: false, errors: [] };
  }
};

export const userLoginValidation = (user) => {
  const errorArray = [];

  const { email, password } = user;
  if (!email) {
    errorArray.push("Email is required");
  }
  if (!password) {
    errorArray.push("Password is required");
  }

  if (errorArray.length > 0) {
    return { errorArray: true, errorArrays: errorArray };
  } else {
    return { errorArray: false, errors: [] };
  }
};
