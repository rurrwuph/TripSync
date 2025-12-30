const allTrips = [
    {
        id: 1,
        from: "Cox's Bazar",
        to: 'Chattogram',
        time: '06:45 AM',
        date: '2026-01-15',
        price: 1565,
        seats: 13,
        type: 'Non-AC'
    },
    {
        id: 2,
        from: "Cox's Bazar",
        to: 'Mymensingh',
        time: '11:45 PM',
        date: '2026-01-09',
        price: 1849,
        seats: 25,
        type: 'AC'
    },
    {
        id: 3,
        from: 'Dhaka',
        to: "Cox's Bazar",
        time: '08:30 AM',
        date: '2026-01-05',
        price: 1158,
        seats: 35,
        type: 'Sleeper AC'
    },
    {
        id: 4,
        from: 'Mymensingh',
        to: 'Khulna',
        time: '02:00 AM',
        date: '2025-12-28',
        price: 1027,
        seats: 5,
        type: 'Non-AC'
    },
    {
        id: 5,
        from: 'Mymensingh',
        to: "Cox's Bazar",
        time: '05:15 AM',
        date: '2026-01-02',
        price: 1071,
        seats: 8,
        type: 'Non-AC'
    },
    {
        id: 6,
        from: 'Sylhet',
        to: 'Chattogram',
        time: '09:00 PM',
        date: '2025-12-29',
        price: 1352,
        seats: 5,
        type: 'Non-AC'
    },
    {
        id: 7,
        from: 'Rajshahi',
        to: 'Rangpur',
        time: '11:30 PM',
        date: '2025-12-23',
        price: 1044,
        seats: 5,
        type: 'AC'
    },
    {
        id: 8,
        from: 'Mymensingh',
        to: 'Jessore',
        time: '10:45 AM',
        date: '2025-12-30',
        price: 1828,
        seats: 31,
        type: 'Non-AC'
    },
    {
        id: 9,
        from: 'Jessore',
        to: 'Rangpur',
        time: '06:30 AM',
        date: '2026-01-08',
        price: 1983,
        seats: 27,
        type: 'Non-AC'
    },
    {
        id: 10,
        from: 'Sylhet',
        to: 'Khulna',
        time: '05:45 PM',
        date: '2026-01-13',
        price: 1368,
        seats: 21,
        type: 'AC'
    },
    {
        id: 11,
        from: 'Sylhet',
        to: 'Rangpur',
        time: '08:00 PM',
        date: '2026-01-09',
        price: 1430,
        seats: 15,
        type: 'Non-AC'
    },
    {
        id: 12,
        from: 'Rajshahi',
        to: 'Chattogram',
        time: '12:45 AM',
        date: '2026-01-12',
        price: 1656,
        seats: 10,
        type: 'Sleeper AC'
    },
    {
        id: 13,
        from: 'Mymensingh',
        to: 'Barishal',
        time: '11:15 AM',
        date: '2025-12-31',
        price: 882,
        seats: 5,
        type: 'Executive'
    },
    {
        id: 14,
        from: 'Rajshahi',
        to: "Cox's Bazar",
        time: '07:45 PM',
        date: '2025-12-27',
        price: 1351,
        seats: 32,
        type: 'Sleeper AC'
    },
    {
        id: 15,
        from: 'Jessore',
        to: 'Khulna',
        time: '03:45 AM',
        date: '2025-12-24',
        price: 1218,
        seats: 27,
        type: 'Non-AC'
    },
    {
        id: 16,
        from: "Cox's Bazar",
        to: 'Jessore',
        time: '12:30 AM',
        date: '2025-12-17',
        price: 1638,
        seats: 8,
        type: 'Non-AC'
    },
    {
        id: 17,
        from: 'Rangpur',
        to: 'Sylhet',
        time: '04:30 AM',
        date: '2025-12-25',
        price: 1336,
        seats: 5,
        type: 'Non-AC'
    },
    {
        id: 18,
        from: 'Chattogram',
        to: 'Rajshahi',
        time: '02:00 PM',
        date: '2026-01-03',
        price: 1035,
        seats: 32,
        type: 'Executive'
    },
    {
        id: 19,
        from: 'Barishal',
        to: 'Dhaka',
        time: '08:45 PM',
        date: '2025-12-28',
        price: 1094,
        seats: 31,
        type: 'Executive'
    },
    {
        id: 20,
        from: 'Jessore',
        to: "Cox's Bazar",
        time: '09:15 PM',
        date: '2025-12-28',
        price: 894,
        seats: 32,
        type: 'Executive'
    },
    {
        id: 21,
        from: 'Mymensingh',
        to: 'Sylhet',
        time: '03:15 PM',
        date: '2025-12-24',
        price: 1409,
        seats: 35,
        type: 'AC'
    },
    {
        id: 22,
        from: "Cox's Bazar",
        to: 'Sylhet',
        time: '10:30 AM',
        date: '2025-12-25',
        price: 1857,
        seats: 12,
        type: 'Sleeper AC'
    },
    {
        id: 23,
        from: 'Dhaka',
        to: 'Khulna',
        time: '05:30 AM',
        date: '2025-12-29',
        price: 1869,
        seats: 6,
        type: 'Sleeper AC'
    },
    {
        id: 24,
        from: 'Jessore',
        to: "Cox's Bazar",
        time: '02:45 PM',
        date: '2025-12-31',
        price: 1544,
        seats: 13,
        type: 'AC'
    },
    {
        id: 25,
        from: 'Rajshahi',
        to: 'Rangpur',
        time: '01:45 PM',
        date: '2026-01-16',
        price: 1552,
        seats: 7,
        type: 'Sleeper AC'
    },
    {
        id: 26,
        from: 'Rangpur',
        to: 'Rajshahi',
        time: '12:30 PM',
        date: '2025-12-29',
        price: 1861,
        seats: 19,
        type: 'Non-AC'
    },
    {
        id: 27,
        from: 'Jessore',
        to: 'Khulna',
        time: '09:30 AM',
        date: '2025-12-24',
        price: 1359,
        seats: 11,
        type: 'Executive'
    },
    {
        id: 28,
        from: 'Barishal',
        to: 'Sylhet',
        time: '08:30 AM',
        date: '2025-12-30',
        price: 1658,
        seats: 15,
        type: 'AC'
    },
    {
        id: 29,
        from: "Cox's Bazar",
        to: 'Mymensingh',
        time: '01:00 AM',
        date: '2026-01-06',
        price: 1544,
        seats: 27,
        type: 'AC'
    },
    {
        id: 30,
        from: 'Barishal',
        to: 'Chattogram',
        time: '12:45 PM',
        date: '2025-12-26',
        price: 1569,
        seats: 14,
        type: 'Non-AC'
    },
    {
        id: 31,
        from: 'Jessore',
        to: 'Barishal',
        time: '02:45 PM',
        date: '2026-01-09',
        price: 1877,
        seats: 17,
        type: 'Non-AC'
    },
    {
        id: 32,
        from: 'Mymensingh',
        to: 'Rangpur',
        time: '02:00 PM',
        date: '2025-12-18',
        price: 1086,
        seats: 23,
        type: 'Executive'
    },
    {
        id: 33,
        from: 'Dhaka',
        to: 'Jessore',
        time: '05:45 PM',
        date: '2026-01-05',
        price: 1121,
        seats: 19,
        type: 'Executive'
    },
    {
        id: 34,
        from: 'Dhaka',
        to: "Cox's Bazar",
        time: '07:45 PM',
        date: '2025-12-22',
        price: 1497,
        seats: 6,
        type: 'Non-AC'
    },
    {
        id: 35,
        from: 'Khulna',
        to: 'Dhaka',
        time: '12:45 PM',
        date: '2025-12-26',
        price: 1407,
        seats: 12,
        type: 'Sleeper AC'
    },
    {
        id: 36,
        from: 'Barishal',
        to: 'Sylhet',
        time: '05:45 PM',
        date: '2025-12-27',
        price: 1345,
        seats: 14,
        type: 'Non-AC'
    },
    {
        id: 37,
        from: 'Mymensingh',
        to: 'Rangpur',
        time: '09:15 AM',
        date: '2026-01-10',
        price: 1435,
        seats: 8,
        type: 'Executive'
    },
    {
        id: 38,
        from: 'Rajshahi',
        to: "Cox's Bazar",
        time: '12:30 AM',
        date: '2026-01-04',
        price: 1234,
        seats: 12,
        type: 'Executive'
    },
    {
        id: 39,
        from: 'Chattogram',
        to: 'Dhaka',
        time: '04:45 PM',
        date: '2025-12-24',
        price: 1011,
        seats: 14,
        type: 'Non-AC'
    },
    {
        id: 40,
        from: 'Rangpur',
        to: 'Dhaka',
        time: '12:15 PM',
        date: '2026-01-13',
        price: 1496,
        seats: 35,
        type: 'Sleeper AC'
    },
    {
        id: 41,
        from: 'Jessore',
        to: "Cox's Bazar",
        time: '09:00 PM',
        date: '2026-01-03',
        price: 1776,
        seats: 6,
        type: 'Sleeper AC'
    },
    {
        id: 42,
        from: 'Sylhet',
        to: 'Barishal',
        time: '08:00 AM',
        date: '2025-12-31',
        price: 1191,
        seats: 20,
        type: 'AC'
    },
    {
        id: 43,
        from: 'Sylhet',
        to: 'Chattogram',
        time: '06:30 AM',
        date: '2026-01-02',
        price: 1062,
        seats: 5,
        type: 'Executive'
    },
    {
        id: 44,
        from: 'Jessore',
        to: 'Chattogram',
        time: '03:45 AM',
        date: '2025-12-25',
        price: 1708,
        seats: 24,
        type: 'Sleeper AC'
    },
    {
        id: 45,
        from: 'Mymensingh',
        to: 'Sylhet',
        time: '04:30 AM',
        date: '2026-01-14',
        price: 813,
        seats: 16,
        type: 'Executive'
    },
    {
        id: 46,
        from: 'Dhaka',
        to: 'Chattogram',
        time: '06:45 PM',
        date: '2025-12-27',
        price: 1477,
        seats: 33,
        type: 'Sleeper AC'
    },
    {
        id: 47,
        from: "Cox's Bazar",
        to: 'Dhaka',
        time: '08:00 PM',
        date: '2026-01-08',
        price: 1852,
        seats: 13,
        type: 'Sleeper AC'
    },
    {
        id: 48,
        from: 'Jessore',
        to: 'Rajshahi',
        time: '09:00 AM',
        date: '2025-12-20',
        price: 1076,
        seats: 28,
        type: 'AC'
    },
    {
        id: 49,
        from: 'Jessore',
        to: 'Khulna',
        time: '11:15 PM',
        date: '2026-01-16',
        price: 1863,
        seats: 24,
        type: 'Sleeper AC'
    },
    {
        id: 50,
        from: 'Barishal',
        to: "Cox's Bazar",
        time: '09:45 PM',
        date: '2026-01-13',
        price: 1019,
        seats: 6,
        type: 'AC'
    },
    {
        id: 51,
        from: 'Mymensingh',
        to: 'Khulna',
        time: '10:15 PM',
        date: '2026-01-13',
        price: 881,
        seats: 17,
        type: 'Executive'
    },
    {
        id: 52,
        from: 'Dhaka',
        to: 'Rajshahi',
        time: '09:45 PM',
        date: '2025-12-21',
        price: 1496,
        seats: 18,
        type: 'AC'
    },
    {
        id: 53,
        from: 'Dhaka',
        to: 'Chattogram',
        time: '04:30 AM',
        date: '2026-01-16',
        price: 1906,
        seats: 7,
        type: 'Non-AC'
    },
    {
        id: 54,
        from: 'Barishal',
        to: 'Khulna',
        time: '03:00 PM',
        date: '2025-12-21',
        price: 1235,
        seats: 24,
        type: 'Sleeper AC'
    },
    {
        id: 55,
        from: 'Sylhet',
        to: 'Rajshahi',
        time: '02:30 PM',
        date: '2026-01-04',
        price: 1406,
        seats: 19,
        type: 'Non-AC'
    },
    {
        id: 56,
        from: 'Khulna',
        to: 'Mymensingh',
        time: '12:00 AM',
        date: '2026-01-13',
        price: 1924,
        seats: 26,
        type: 'AC'
    },
    {
        id: 57,
        from: "Cox's Bazar",
        to: 'Sylhet',
        time: '08:45 PM',
        date: '2026-01-03',
        price: 1250,
        seats: 8,
        type: 'Sleeper AC'
    },
    {
        id: 58,
        from: 'Barishal',
        to: "Cox's Bazar",
        time: '05:30 PM',
        date: '2025-12-30',
        price: 1811,
        seats: 30,
        type: 'Non-AC'
    },
    {
        id: 59,
        from: "Cox's Bazar",
        to: 'Barishal',
        time: '01:45 AM',
        date: '2026-01-04',
        price: 1129,
        seats: 6,
        type: 'Sleeper AC'
    },
    {
        id: 60,
        from: 'Khulna',
        to: 'Dhaka',
        time: '12:30 AM',
        date: '2026-01-04',
        price: 1107,
        seats: 18,
        type: 'AC'
    },
    {
        id: 61,
        from: 'Barishal',
        to: "Cox's Bazar",
        time: '06:00 PM',
        date: '2025-12-30',
        price: 1344,
        seats: 20,
        type: 'AC'
    },
    {
        id: 62,
        from: 'Rangpur',
        to: "Cox's Bazar",
        time: '04:45 AM',
        date: '2026-01-08',
        price: 833,
        seats: 13,
        type: 'Executive'
    },
    {
        id: 63,
        from: 'Jessore',
        to: 'Barishal',
        time: '01:30 PM',
        date: '2026-01-02',
        price: 957,
        seats: 6,
        type: 'Executive'
    },
    {
        id: 64,
        from: 'Rajshahi',
        to: 'Rangpur',
        time: '09:30 AM',
        date: '2026-01-14',
        price: 1353,
        seats: 7,
        type: 'Sleeper AC'
    },
    {
        id: 65,
        from: 'Mymensingh',
        to: 'Chattogram',
        time: '08:30 AM',
        date: '2025-12-19',
        price: 1546,
        seats: 31,
        type: 'AC'
    },
    {
        id: 66,
        from: 'Khulna',
        to: 'Rajshahi',
        time: '03:45 PM',
        date: '2026-01-05',
        price: 1556,
        seats: 24,
        type: 'AC'
    },
    {
        id: 67,
        from: 'Dhaka',
        to: 'Jessore',
        time: '09:15 PM',
        date: '2025-12-24',
        price: 1680,
        seats: 13,
        type: 'Sleeper AC'
    },
    {
        id: 68,
        from: 'Mymensingh',
        to: 'Khulna',
        time: '11:30 AM',
        date: '2026-01-12',
        price: 1171,
        seats: 17,
        type: 'AC'
    },
    {
        id: 69,
        from: 'Mymensingh',
        to: 'Khulna',
        time: '09:00 PM',
        date: '2025-12-26',
        price: 1538,
        seats: 10,
        type: 'Sleeper AC'
    },
    {
        id: 70,
        from: 'Khulna',
        to: 'Barishal',
        time: '12:15 AM',
        date: '2025-12-29',
        price: 1149,
        seats: 26,
        type: 'AC'
    },
    {
        id: 71,
        from: 'Rangpur',
        to: 'Jessore',
        time: '09:15 AM',
        date: '2025-12-28',
        price: 1011,
        seats: 5,
        type: 'Non-AC'
    },
    {
        id: 72,
        from: "Cox's Bazar",
        to: 'Khulna',
        time: '09:30 PM',
        date: '2026-01-12',
        price: 1363,
        seats: 14,
        type: 'Non-AC'
    },
    {
        id: 73,
        from: 'Sylhet',
        to: 'Dhaka',
        time: '08:30 PM',
        date: '2026-01-16',
        price: 1036,
        seats: 8,
        type: 'Sleeper AC'
    },
    {
        id: 74,
        from: 'Rajshahi',
        to: "Cox's Bazar",
        time: '09:30 AM',
        date: '2025-12-20',
        price: 1292,
        seats: 31,
        type: 'Executive'
    },
    {
        id: 75,
        from: 'Sylhet',
        to: 'Rangpur',
        time: '12:30 AM',
        date: '2026-01-08',
        price: 1304,
        seats: 31,
        type: 'AC'
    },
    {
        id: 76,
        from: 'Dhaka',
        to: 'Chattogram',
        time: '07:00 PM',
        date: '2025-12-24',
        price: 1016,
        seats: 30,
        type: 'Executive'
    },
    {
        id: 77,
        from: 'Rajshahi',
        to: 'Dhaka',
        time: '05:30 PM',
        date: '2025-12-23',
        price: 1472,
        seats: 23,
        type: 'Sleeper AC'
    },
    {
        id: 78,
        from: 'Barishal',
        to: 'Khulna',
        time: '11:00 PM',
        date: '2026-01-03',
        price: 1236,
        seats: 19,
        type: 'AC'
    },
    {
        id: 79,
        from: 'Barishal',
        to: 'Mymensingh',
        time: '06:00 AM',
        date: '2025-12-18',
        price: 1583,
        seats: 11,
        type: 'Non-AC'
    },
    {
        id: 80,
        from: 'Barishal',
        to: 'Rajshahi',
        time: '07:15 PM',
        date: '2025-12-21',
        price: 1270,
        seats: 16,
        type: 'AC'
    },
    {
        id: 81,
        from: 'Jessore',
        to: 'Chattogram',
        time: '03:15 AM',
        date: '2025-12-30',
        price: 1334,
        seats: 9,
        type: 'Sleeper AC'
    },
    {
        id: 82,
        from: 'Rajshahi',
        to: 'Dhaka',
        time: '06:30 PM',
        date: '2026-01-14',
        price: 1445,
        seats: 34,
        type: 'Sleeper AC'
    },
    {
        id: 83,
        from: "Cox's Bazar",
        to: 'Khulna',
        time: '10:30 PM',
        date: '2026-01-05',
        price: 1551,
        seats: 20,
        type: 'Non-AC'
    },
    {
        id: 84,
        from: 'Sylhet',
        to: 'Barishal',
        time: '05:00 AM',
        date: '2026-01-11',
        price: 1562,
        seats: 31,
        type: 'AC'
    },
    {
        id: 85,
        from: 'Chattogram',
        to: 'Rangpur',
        time: '12:30 PM',
        date: '2026-01-03',
        price: 1556,
        seats: 28,
        type: 'AC'
    },
    {
        id: 86,
        from: 'Dhaka',
        to: 'Barishal',
        time: '04:45 AM',
        date: '2025-12-17',
        price: 1835,
        seats: 29,
        type: 'Sleeper AC'
    },
    {
        id: 87,
        from: 'Barishal',
        to: 'Sylhet',
        time: '11:45 AM',
        date: '2025-12-24',
        price: 1636,
        seats: 26,
        type: 'Non-AC'
    },
    {
        id: 88,
        from: 'Chattogram',
        to: 'Rajshahi',
        time: '01:15 AM',
        date: '2026-01-15',
        price: 834,
        seats: 15,
        type: 'Executive'
    },
    {
        id: 89,
        from: 'Rajshahi',
        to: 'Barishal',
        time: '03:00 PM',
        date: '2025-12-25',
        price: 1494,
        seats: 5,
        type: 'AC'
    },
    {
        id: 90,
        from: 'Chattogram',
        to: 'Barishal',
        time: '10:00 PM',
        date: '2025-12-19',
        price: 1613,
        seats: 15,
        type: 'AC'
    },
    {
        id: 91,
        from: 'Mymensingh',
        to: 'Rangpur',
        time: '06:00 AM',
        date: '2026-01-04',
        price: 1451,
        seats: 10,
        type: 'AC'
    },
    {
        id: 92,
        from: 'Barishal',
        to: 'Jessore',
        time: '09:15 PM',
        date: '2025-12-25',
        price: 1017,
        seats: 15,
        type: 'Non-AC'
    },
    {
        id: 93,
        from: 'Jessore',
        to: 'Rajshahi',
        time: '04:30 AM',
        date: '2025-12-22',
        price: 1004,
        seats: 35,
        type: 'Sleeper AC'
    },
    {
        id: 94,
        from: 'Mymensingh',
        to: 'Rangpur',
        time: '03:30 PM',
        date: '2026-01-15',
        price: 1936,
        seats: 15,
        type: 'AC'
    },
    {
        id: 95,
        from: 'Mymensingh',
        to: "Cox's Bazar",
        time: '01:15 AM',
        date: '2026-01-09',
        price: 1221,
        seats: 22,
        type: 'AC'
    },
    {
        id: 96,
        from: 'Jessore',
        to: 'Chattogram',
        time: '10:30 AM',
        date: '2026-01-04',
        price: 1787,
        seats: 16,
        type: 'Non-AC'
    },
    {
        id: 97,
        from: 'Rajshahi',
        to: 'Sylhet',
        time: '11:30 AM',
        date: '2025-12-20',
        price: 1145,
        seats: 8,
        type: 'Sleeper AC'
    },
    {
        id: 98,
        from: 'Barishal',
        to: 'Chattogram',
        time: '01:00 PM',
        date: '2025-12-21',
        price: 1978,
        seats: 31,
        type: 'Sleeper AC'
    },
    {
        id: 99,
        from: 'Barishal',
        to: 'Sylhet',
        time: '09:00 AM',
        date: '2026-01-07',
        price: 875,
        seats: 9,
        type: 'Executive'
    },
    {
        id: 100,
        from: 'Chattogram',
        to: 'Khulna',
        time: '04:15 AM',
        date: '2026-01-04',
        price: 1199,
        seats: 18,
        type: 'AC'
    }
]

export default allTrips;