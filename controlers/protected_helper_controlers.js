const allowedFields = [
  "name",
  "email",
  "location",
  "profile_image_url"
];

export function createUpdateQuery(userId,data) {
 console.log("hi aiam here try ai -->")
 console.log(data)
 const data_keys = Object.keys(data);

for (let field of allowedFields) {

    for (let key of data_keys) {
        console.log(field , key)
        if (field === key) {
            console.log(key);
        }

    }
}
  
  const selectedFields = Object.keys(data)
    .filter(field => allowedFields.includes(field));
    console.log(selectedFields)
  if (selectedFields.length === 0) {
    return null;
  }

  const setParts = selectedFields.map(
    (field, index) => `${field} = $${index + 1}`
  );

  const values = selectedFields.map(
    field => data[field]
  );

  values.push(userId);

  const query = `
    UPDATE user_info
    SET ${setParts.join(", ")}
    WHERE id = $${values.length}
    RETURNING *;
  `;
  console.log(query , values)
  return {
    query,
    values
  };
}



