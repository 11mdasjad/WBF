export type City = { name: string; state: string; aliases?: string[] };

// Cities available in the location picker; this is not a list of WBF offices.
export const cities: City[] = [
  { name: "Agra", state: "Uttar Pradesh" },
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Amritsar", state: "Punjab" },
  { name: "Bengaluru", state: "Karnataka", aliases: ["Bangalore"] },
  { name: "Bhopal", state: "Madhya Pradesh" },
  { name: "Bhubaneswar", state: "Odisha" },
  { name: "Chandigarh", state: "Chandigarh" },
  { name: "Chennai", state: "Tamil Nadu", aliases: ["Madras"] },
  { name: "Coimbatore", state: "Tamil Nadu" },
  { name: "Dehradun", state: "Uttarakhand" },
  { name: "Delhi", state: "Delhi", aliases: ["New Delhi"] },
  { name: "Faridabad", state: "Haryana" },
  { name: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Gurugram", state: "Haryana", aliases: ["Gurgaon"] },
  { name: "Guwahati", state: "Assam" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Jaipur", state: "Rajasthan" },
  { name: "Jammu", state: "Jammu & Kashmir" },
  { name: "Jodhpur", state: "Rajasthan" },
  { name: "Kanpur", state: "Uttar Pradesh" },
  { name: "Kochi", state: "Kerala", aliases: ["Cochin"] },
  { name: "Kolkata", state: "West Bengal", aliases: ["Calcutta"] },
  { name: "Lucknow", state: "Uttar Pradesh" },
  { name: "Ludhiana", state: "Punjab" },
  { name: "Mumbai", state: "Maharashtra", aliases: ["Bombay"] },
  { name: "Nagpur", state: "Maharashtra" },
  { name: "Nashik", state: "Maharashtra" },
  { name: "Noida", state: "Uttar Pradesh" },
  { name: "Panaji", state: "Goa", aliases: ["Panjim"] },
  { name: "Patna", state: "Bihar" },
  { name: "Prayagraj", state: "Uttar Pradesh", aliases: ["Allahabad"] },
  { name: "Pune", state: "Maharashtra" },
  { name: "Raipur", state: "Chhattisgarh" },
  { name: "Ranchi", state: "Jharkhand" },
  { name: "Shimla", state: "Himachal Pradesh" },
  { name: "Srinagar", state: "Jammu & Kashmir", aliases: ["Sri Nagar"] },
  { name: "Surat", state: "Gujarat" },
  { name: "Thiruvananthapuram", state: "Kerala", aliases: ["Trivandrum"] },
  { name: "Udaipur", state: "Rajasthan" },
  { name: "Vadodara", state: "Gujarat", aliases: ["Baroda"] },
  { name: "Varanasi", state: "Uttar Pradesh", aliases: ["Banaras"] },
  { name: "Visakhapatnam", state: "Andhra Pradesh", aliases: ["Vizag"] },
];
export const popularCities = [
  "Pune",
  "Mumbai",
  "Jaipur",
  "Hyderabad",
  "Delhi",
].map((name) => cities.find((city) => city.name === name)!);
export function searchCities(query: string) {
  const value = query.trim().toLocaleLowerCase();
  return cities.filter((city) =>
    [city.name, city.state, ...(city.aliases || [])].some((term) =>
      term.toLocaleLowerCase().includes(value),
    ),
  );
}
export function matchesCity(location: string, city: City) {
  const terms = [city.name, ...(city.aliases || [])];
  if (city.name === "Delhi")
    terms.push(
      "Khizrabad",
      "New Friends Colony",
      "Kalindi Kunj",
      "Bharat Mandapam",
    );
  const text = location.toLocaleLowerCase();
  return terms.some((term) => text.includes(term.toLocaleLowerCase()));
}
