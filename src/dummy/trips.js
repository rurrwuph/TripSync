export default function generateRandomTrips(count = 100) {
  const CITIES = [
    "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna",
    "Barishal", "Rangpur", "Mymensingh", "Cox's Bazar", "Jessore"
  ];
  const TYPES = ["AC", "Non-AC", "Sleeper AC", "Executive"];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomTime = () => {
    const hour = getRandomInt(1, 12).toString().padStart(2, '0');
    const minute = (getRandomInt(0, 3) * 15).toString().padStart(2, '0');
    const ampm = getRandom(['AM', 'PM']);
    return `${hour}:${minute} ${ampm}`;
  };

  const getRandomDate = () => {
    const startDate = new Date('2025-12-17');
    const futureDate = new Date(startDate.getTime() + getRandomInt(0, 30) * 24 * 60 * 60 * 1000);

    const year = futureDate.getFullYear();
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const day = futureDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const schedules = [];

  for (let i = 1; i <= count; i++) {
    let from, to;
    do {
      from = getRandom(CITIES);
      to = getRandom(CITIES);
    } while (from === to);

    const busType = getRandom(TYPES);
    let priceRange = [800, 1500];

    if (busType.includes("AC")) {
      priceRange = [1000, 2000];
    } else if (busType.includes("Sleeper")) {
      priceRange = [1800, 3000];
    }

    schedules.push({
      id: i,
      from: from,
      to: to,
      time: getRandomTime(),
      date: getRandomDate(),
      price: getRandomInt(priceRange[0], priceRange[1]),
      seats: getRandomInt(5, 35),
      type: busType,
    });
  }

  return schedules;
}
