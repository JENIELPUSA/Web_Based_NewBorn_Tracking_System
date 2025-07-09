const mongoose = require('mongoose'); 
class Apifeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'limit']; 
    excludedFields.forEach((el) => delete queryObj[el]); 
    
    if (queryObj.equipmentId) {
       queryObj['Equipments'] = new mongoose.Types.ObjectId(queryObj.equipmentId); 
      delete queryObj.equipmentId;
    }else if(queryObj.Equipments){
      queryObj['Equipments'] = new mongoose.Types.ObjectId(queryObj.Equipments); 
    }

    this.query = this.query.find(queryObj);
  
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy); 
    } else {
      this.query = this.query.sort("-createdAt"); // Default sorting (e.g., by createdAt)
    }
    return this; 
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields); // Apply field selection
    } else {
      this.query = this.query.select("-__v"); // Exclude the '__v' field by default
    }
    return this; // Returning `this` for method chaining
  }

  // Pagination logic
  paginate() {
    const page = this.queryString.page * 1 || 1; // Default to page 1
    const limit = this.queryString.limit * 1 || 100; // Default to limit of 100
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit); // Apply pagination
    return this; // Returning `this` for method chaining
  }
}

module.exports = Apifeatures;
