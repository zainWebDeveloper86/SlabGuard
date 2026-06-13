// services/electricityService.js

export const calculateSlab = (units) => {
  if (units <= 100) return { slab: "1 - 100", rate: 13.48, color: "green" };
  if (units <= 200) return { slab: "101 - 200", rate: 18.95, color: "yellow" };
  if (units <= 300) return { slab: "201 - 300", rate: 22.14, color: "orange" };
  return { slab: "300+", rate: 35.24, color: "red" };
};