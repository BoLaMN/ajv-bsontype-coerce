# ajv-bsontype-coerce

coerces mongodb's bsonType validators

* npm install ajv-bsontype-coerce --save

## Setup

```
var Ajv = require('ajv');
var ajv = new Ajv;
require('ajv-bsontype-coerce')(ajv);
```

### Usage

```
const schema = {
   required: [ "name", "year", "major", "gpa" ],
   properties: {
      name: {
         bsonType: "string",
         coerce: true,
         description: "must be a string and is required"
      },
      gender: {
         bsonType: "string",
         coerce: true,
         description: "must be a string and is not required"
      },
      year: {
         bsonType: "int",
         coerce: true,
         description: "must be an integer in [ 2017, 3017 ] and is required"
      },
      major: {
         enum: [ "Math", "English", "Computer Science", "History", null ],
         description: "can only be one of the enum values and is required"
      },
      gpa: {
         bsonType: [ "double" ],
         coerce: true,
         description: "must be a double and is required"
      }
   }
}

const data = {
   name: "Alice",
   year: 2019,
   major: "History",
   gpa: 3
}

ajv.validate(schema, data)
```

License: MIT
