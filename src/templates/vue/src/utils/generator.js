import { faker } from '@faker-js/faker';


const generateData = (dataTypes, name) => {
  const exists = localStorage.getItem(`${name}-data`);
  if (exists) {
    return JSON.parse(exists);
  }
  const records = [];
  for (let i = 0; i < 30; i++) {
    const record = { id: faker.string.uuid() };  // Generate a unique ID for each row

    dataTypes.forEach(field => {
      if (field.type === 'text') {
        if (field.id) {
          switch (field.id) {
            case 'taxId':
              record[field.id] = faker.finance.routingNumber(); // Use your preferred method to generate Tax Id
              break;
            case 'email':
              record[field.id] = faker.internet.email();
              break;
            case 'phone':
              record[field.id] = faker.phone.number();
              break;
            case 'name':
              record[field.id] = faker.person.fullName();
              break;
            default:
              record[field.id] = faker.lorem.word(); // Default case to handle variation if it's set but not caught by switch
          }
        } else {
          record[field.id] = faker.lorem.word();
        }
      }else if (field.type === 'number') {
        if(Object.prototype.hasOwnProperty.call(field, 'min') && Object.prototype.hasOwnProperty.call(field, 'max')){
          record[field.id] = faker.datatype.number({min: field.min, max: field.max});
        }else{
          record[field.id] = faker.datatype.number();
        }
      }
    });

    records.push(record);
  }
  localStorage.setItem(`${name}-data`, JSON.stringify(records))
  return records;
};

export default generateData;