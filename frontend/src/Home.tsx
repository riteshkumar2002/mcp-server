
const defaultSchema = {
  type: 'object',
  properties: {
    time: {
      type: 'string',
      title: 'Last Login Time'
    }
  },
  required: ['time']
}

const defaultUiSchema = {
  type: 'Control',
  scope: '#/properties/time'
}

const parseJson = (value: any) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (error) {
      console.error('Error parsing schema string:', error)
      return value
    }
  }
  return value
}
 
const Home = (
  store: any,
  dynamicData: any,
  pageData: any = {}
) => {
  const schema = pageData?.schema ? parseJson(pageData.schema) : defaultSchema
  const uiSchema = pageData?.uiSchema ? parseJson(pageData.uiSchema) : defaultUiSchema

  return {
    setPage: async function () {
      const currentSchema = this.getSchema()
      const currentUiSchema = this.getUiSchema()
      store.setSchema(currentSchema)
      store.setUiSchema(currentUiSchema)
      const formdata = this.getFormData()
      store.setFormdata(formdata)
    },
    getLastLoginDate: function () {
      return new Date().toLocaleString()
    },
    getFormData: function () {
      const date = this.getLastLoginDate()
      return { time: date }
    },
    getUiSchema: function () {
      return uiSchema
    },
    getSchema: () => {
      return schema
    }
  }
};
 
export default Home;