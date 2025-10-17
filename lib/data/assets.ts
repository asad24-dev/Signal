// Mock Asset Definitions for Signal
// THREE FOCUSED ASSETS: Lithium, Oil, Semiconductors

import type { Asset } from "@/types";

export const ASSETS: Asset[] = [
  {
    id: "lithium",
    name: "Lithium",
    symbol: "Li",
    type: "commodity",
    category: "metals",
    description: "Critical battery metal for electric vehicles and energy storage. Chile and Australia dominate global supply.",
    currentRiskScore: 4.2,
    riskLevel: "moderate",
    lastUpdated: new Date(),
    
    monitoringConfig: {
      regions: ["Chile", "Australia", "Argentina", "China"],
      keywords: ["strike", "mining", "production", "closure", "disruption", "protest", "regulation"],
      relatedCompanies: [
        {
          name: "SQM",
          symbol: "SQM",
          exposure: 95,
          relationship: "producer"
        },
        {
          name: "Albemarle Corporation",
          symbol: "ALB",
          exposure: 90,
          relationship: "producer"
        },
        {
          name: "Tesla",
          symbol: "TSLA",
          exposure: 75,
          relationship: "consumer"
        },
        {
          name: "Panasonic",
          symbol: "PCRFY",
          exposure: 70,
          relationship: "consumer"
        },
        {
          name: "Pilbara Minerals",
          symbol: "PLS.AX",
          exposure: 85,
          relationship: "competitor"
        },
        {
          name: "Ganfeng Lithium",
          symbol: "1772.HK",
          exposure: 80,
          relationship: "producer"
        }
      ],
      sources: ["El Mercurio", "Bloomberg", "Mining.com", "Reuters", "Financial Times"]
    },
    
    supplyChain: {
      topProducers: [
        {
          name: "Salar de Atacama (SQM)",
          country: "Chile",
          globalShare: 22,
          coordinates: [-23.6980, -68.2650]
        },
        {
          name: "Greenbushes Mine (Albemarle/Tianqi)",
          country: "Australia",
          globalShare: 18,
          coordinates: [-33.8568, 116.0623]
        },
        {
          name: "Mt. Cattlin (Albemarle)",
          country: "Australia",
          globalShare: 8,
          coordinates: [-32.5789, 121.9012]
        },
        {
          name: "Salar de Olaroz",
          country: "Argentina",
          globalShare: 5,
          coordinates: [-23.9736, -66.4597]
        }
      ],
      topConsumers: [
        {
          name: "China",
          country: "China",
          demand: 45
        },
        {
          name: "United States",
          country: "USA",
          demand: 18
        },
        {
          name: "South Korea",
          country: "South Korea",
          demand: 12
        }
      ],
      criticalNodes: [
        {
          name: "Salar de Atacama",
          type: "mine",
          location: "Atacama Desert, Chile",
          importance: 10
        },
        {
          name: "Port of Antofagasta",
          type: "port",
          location: "Antofagasta, Chile",
          importance: 8
        },
        {
          name: "Greenbushes Processing Plant",
          type: "processing_plant",
          location: "Western Australia",
          importance: 9
        }
      ]
    }
  },
  
  {
    id: "oil",
    name: "Crude Oil",
    symbol: "CL",
    type: "commodity",
    category: "energy",
    description: "The world's most traded commodity. Middle East tensions and OPEC decisions drive volatility.",
    currentRiskScore: 5.8,
    riskLevel: "moderate",
    lastUpdated: new Date(),
    
    monitoringConfig: {
      regions: ["Saudi Arabia", "Iran", "Iraq", "UAE", "Russia", "USA", "Venezuela"],
      keywords: ["opec", "production cut", "sanctions", "strait of hormuz", "pipeline", "conflict", "embargo"],
      relatedCompanies: [
        {
          name: "Saudi Aramco",
          symbol: "2222.SR",
          exposure: 95,
          relationship: "producer"
        },
        {
          name: "ExxonMobil",
          symbol: "XOM",
          exposure: 90,
          relationship: "producer"
        },
        {
          name: "BP",
          symbol: "BP",
          exposure: 85,
          relationship: "producer"
        },
        {
          name: "Chevron",
          symbol: "CVX",
          exposure: 88,
          relationship: "producer"
        }
      ],
      sources: ["Reuters", "Bloomberg Energy", "OPEC News", "Middle East Eye", "Platts"]
    },
    
    supplyChain: {
      topProducers: [
        {
          name: "Ghawar Field",
          country: "Saudi Arabia",
          globalShare: 6,
          coordinates: [25.4167, 49.9167]
        },
        {
          name: "Permian Basin",
          country: "USA",
          globalShare: 12,
          coordinates: [31.8457, -102.3676]
        },
        {
          name: "West Siberian Basin",
          country: "Russia",
          globalShare: 11,
          coordinates: [61.5240, 72.1560]
        }
      ],
      topConsumers: [
        {
          name: "United States",
          country: "USA",
          demand: 20
        },
        {
          name: "China",
          country: "China",
          demand: 16
        },
        {
          name: "India",
          country: "India",
          demand: 5
        }
      ],
      criticalNodes: [
        {
          name: "Strait of Hormuz",
          type: "port",
          location: "Persian Gulf",
          importance: 10
        },
        {
          name: "Suez Canal",
          type: "port",
          location: "Egypt",
          importance: 9
        },
        {
          name: "Ras Tanura Terminal",
          type: "port",
          location: "Saudi Arabia",
          importance: 9
        }
      ]
    }
  },
  
  {
    id: "semiconductors",
    name: "Semiconductors",
    symbol: "SOXX",
    type: "stock",
    category: "technology",
    description: "Critical technology components. Taiwan and South Korea dominate production. Geopolitical tensions pose major supply chain risk.",
    currentRiskScore: 6.5,
    riskLevel: "elevated",
    lastUpdated: new Date(),
    
    monitoringConfig: {
      regions: ["Taiwan", "South Korea", "China", "USA", "Japan"],
      keywords: ["tsmc", "china taiwan", "sanctions", "chip shortage", "export controls", "fab", "manufacturing"],
      relatedCompanies: [
        {
          name: "Taiwan Semiconductor (TSMC)",
          symbol: "TSM",
          exposure: 95,
          relationship: "producer"
        },
        {
          name: "NVIDIA",
          symbol: "NVDA",
          exposure: 85,
          relationship: "consumer"
        },
        {
          name: "Apple",
          symbol: "AAPL",
          exposure: 90,
          relationship: "consumer"
        },
        {
          name: "Samsung Electronics",
          symbol: "005930.KS",
          exposure: 92,
          relationship: "producer"
        },
        {
          name: "Intel",
          symbol: "INTC",
          exposure: 80,
          relationship: "producer"
        },
        {
          name: "AMD",
          symbol: "AMD",
          exposure: 88,
          relationship: "consumer"
        }
      ],
      sources: ["DigiTimes", "EE Times", "Nikkei Asia", "Taiwan News", "The Verge"]
    },
    
    supplyChain: {
      topProducers: [
        {
          name: "TSMC Fab 18",
          country: "Taiwan",
          globalShare: 28,
          coordinates: [24.7805, 120.9960]
        },
        {
          name: "Samsung Giheung Campus",
          country: "South Korea",
          globalShare: 18,
          coordinates: [37.2983, 127.0527]
        },
        {
          name: "Intel Fab 42",
          country: "USA",
          globalShare: 8,
          coordinates: [33.3833, -111.8833]
        }
      ],
      topConsumers: [
        {
          name: "United States",
          country: "USA",
          demand: 30
        },
        {
          name: "China",
          country: "China",
          demand: 35
        },
        {
          name: "European Union",
          country: "EU",
          demand: 15
        }
      ],
      criticalNodes: [
        {
          name: "TSMC Headquarters",
          type: "processing_plant",
          location: "Hsinchu, Taiwan",
          importance: 10
        },
        {
          name: "Port of Kaohsiung",
          type: "port",
          location: "Taiwan",
          importance: 9
        },
        {
          name: "Incheon Airport",
          type: "port",
          location: "South Korea",
          importance: 8
        }
      ]
    }
  }
];

// Helper function to get asset by ID
export function getAssetById(id: string): Asset | undefined {
  return ASSETS.find(asset => asset.id === id);
}

// Helper function to get all asset IDs
export function getAssetIds(): string[] {
  return ASSETS.map(asset => asset.id);
}
