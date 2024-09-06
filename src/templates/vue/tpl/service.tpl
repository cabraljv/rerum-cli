

@begin_module@
@begin_class@

const currentData = ()=>{
  return JSON.parse(localStorage.getItem('#className#-data'))
}

export const get#className#s = async (filters, page, limit) => { // get all
  const filteredData = currentData().filter(item => {
    let valid = true
    for (let key in filters) {
      if(!filters[key]) continue
      if(item[key].toLowerCase().indexOf(filters[key].toLowerCase()) === -1){
        valid = false
        break
      }
    }
    return valid
  })

  const data = filteredData.slice((page - 1) * limit, page * limit)
  return {
    data,
    total: filteredData.length
  }
}
export const get#className# = async (itemId) => { // get one
  return currentData().find(item => item.id === itemId)  
}

export const create#className# = async (data) => { 
  const currData = currentData()
  currData.push(data)
  localStorage.setItem('#className#-data', JSON.stringify(currData))
  return true
}
export const delete#className# = async (itemId) => { // delete
  const index = currentData().findIndex(item => item.id === itemId)
  const currData = currentData()
  if (index !== -1) {
    currData.splice(index, 1)
  }
  localStorage.setItem('#className#-data', JSON.stringify(currData))
  return true
}
export const update#className# = async (item) => { // update
}
@end_class@
@end_module@