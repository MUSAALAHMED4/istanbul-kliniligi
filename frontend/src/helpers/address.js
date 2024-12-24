import instance from "base_url";

const getSehirData = async (fn) => {
    try {
      const { data } = await instance.get("/cities/");
      fn(data.results);
    } catch (e) {
      console.error(e);
    }
  };

  const getIlceData = async (city, fn) => {
    try {
      const { data } = await instance.get(`/cities/${city.id}/districts/`);
      fn(data);
    } catch (e) {
      console.error(e);
    }
  };

  const getMahalleData = async (district, fn) => {
    try {
      const { data } = await instance.get(`/districts/${district.id}/neighborhoods/`);
      fn(data);
    } catch (e) {
      console.error(e);
    }
  };

  export { getSehirData, getIlceData, getMahalleData };