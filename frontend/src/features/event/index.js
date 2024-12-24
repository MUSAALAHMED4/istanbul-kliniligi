import instance from "base_url";

export const getEvents = async (id) => {
  try {
    const { data } = await instance.get(`/event/${id}/`);
    return data;
  } catch (e) {
    console.error("Error fetching events:", e);
  }
};
