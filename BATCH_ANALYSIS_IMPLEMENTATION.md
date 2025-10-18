# 🚀 Batch Analysis & Feature Building - Implementation Log

## Date: October 18, 2025

---

## ✅ PHASE 1: BATCH ANALYSIS SYSTEM - IN PROGRESS

### Files Created:
1. **`app/api/analyze-batch/route.ts`** ✅
   - POST endpoint for batch analysis
   - Groups headlines by asset (lithium, oil, semiconductors)
   - Calls Perplexity Sonar Pro for holistic analysis
   - Returns 3 RiskSignals (one per asset)
   - Cost: ~$0.035 per batch (single Sonar Pro call)

2. **`lib/perplexity/batch-chat.ts`** ✅
   - Analyzes ALL flagged headlines together
   - Considers cross-asset impacts
   - Returns balanced risk scores (not extreme)
   - Provides 5 trading opportunities
   - Prompt emphasizes realistic scoring (full 0-10 scale)

### Key Features:
- **Holistic Analysis**: All headlines analyzed together for context
- **Cross-Asset Impacts**: Oil affects semiconductors, lithium affects oil demand
- **Balanced Scoring**: Not every event = 10/10 critical
- **5 Trading Opportunities**: Mix of long/short, conservative/aggressive
- **Smart Grouping**: Headlines grouped by matched asset

### Prompt Strategy:
```
CRITICAL REQUIREMENTS:
1. BALANCED SCORING: Not every negative event is a 10/10 catastrophe
2. CROSS-ASSET IMPACTS: Oil prices affect semiconductor manufacturing costs
3. AGGREGATE EFFECTS: Multiple small events may compound or cancel out
4. POSITIVE NEWS: Weigh positive developments that reduce risk
5. REALISTIC CHANGES: Typical score changes are ±1-3 points, not ±7-10
```

---

## 📋 NEXT PHASES:

### PHASE 2: Live Scan Cooldown (10 minutes) - PENDING
- Change interval from 60s → 600s
- Keep silent (no UI changes)
- No countdown timer

### PHASE 3: Remove Individual "ANALYZE THIS" Buttons - PENDING
- Remove from headline cards
- Keep only batch analysis button

### PHASE 4: Add "ANALYZE ALL SIGNALS" Button - PENDING
- Location: Below "AUTO MODE ACTIVE" in Discovery Stream
- Triggers batch analysis of all flagged headlines
- Shows loading state during analysis
- Updates all 3 assets at once

### PHASE 5: Timeline Chart - PENDING
- Line chart showing risk score history
- Event markers where analyses happened
- Dropdown: "24 hours" (default) and "7 days"
- Separate charts for each asset (3 total)
- Install recharts library

### PHASE 6: Global Risk Map - PENDING
- Supply chain locations (mines, refineries, ports)
- Heatmap overlay showing risk intensity
- Clickable markers with details
- Real-time updates on analysis
- Install leaflet + react-leaflet

### PHASE 7: Trading Opportunities Panel - PENDING
- Display 5 opportunities from current analysis
- Show: Type (long/short), Actions, ROI %, Timeframe
- Update when new analysis runs
- No historical tracking
- No external links

---

## 🎯 CONFIRMED REQUIREMENTS:

### Batch Analysis:
✅ Button below "AUTO MODE ACTIVE"  
✅ Average scores + cross-asset impacts  
✅ Cost not a concern ($0.82/batch acceptable)  
✅ LLM-driven scoring (not hardcoded)  
✅ Remove individual "ANALYZE THIS" buttons  

### Live Scan:
✅ 10-minute interval after initial scan  
✅ NO countdown timer (silent)  
✅ NO manual override  
✅ NO UI changes  

### Timeline Chart:
✅ Line chart + event markers  
✅ Dropdown: 24h (default) / 7 days  
✅ Separate charts per asset  

### Global Map:
✅ Supply chain locations  
✅ Heatmap overlay  
✅ Clickable markers  
✅ Real-time updates  

### Trading Opportunities:
✅ 5 opportunities (was 3)  
✅ Type, Actions, ROI, Timeframe  
✅ NO historical tracking  
✅ NO external links  

---

## 💰 COST ANALYSIS:

### Batch Analysis:
- **Single call**: $0.035 (Sonar Pro)
- **Analyzes**: All flagged headlines (typically 10-25)
- **Updates**: All 3 assets
- **Benefit**: Way more efficient than individual analysis ($0.035 × 20 = $0.70)

### Individual Analysis (OLD):
- **Per headline**: $0.035
- **20 headlines**: $0.70
- **Inefficient**: Each analyzed in isolation

### Savings:
- **Batch**: $0.035 for 20 headlines
- **Individual**: $0.70 for 20 headlines
- **Savings**: 95% cost reduction! 🎉

---

## 🔧 TECHNICAL NOTES:

### Batch Analysis Flow:
```
User clicks "ANALYZE ALL SIGNALS" →
Frontend sends all flagged headlines to /api/analyze-batch →
Backend groups by asset →
Single Sonar Pro call analyzes everything →
Returns 3 RiskSignals (lithium, oil, semiconductors) →
Dashboard updates all 3 assets
```

### Cross-Asset Impact Examples:
- Oil price spike → Semiconductor manufacturing costs increase
- Lithium shortage → EV production delays → Less oil demand
- Semiconductor shortage → Industrial automation delays → Affects all sectors

### Scoring Philosophy:
- OLD: Hardcoded formulas, every event treated same
- NEW: LLM reads context, balances positive/negative, realistic changes
- Example: Pipeline affecting 2% supply = +1.5 change (not +7)

---

## 📊 STATUS:

**Completed:**
- ✅ Batch analysis API endpoint
- ✅ Batch chat handler with balanced scoring
- ✅ 5 trading opportunities (updated from 3)
- ✅ Cross-asset impact logic
- ✅ Holistic prompt design

**In Progress:**
- 🔄 Testing batch analysis endpoint
- 🔄 Integrating with frontend

**Pending:**
- ⏳ Live scan cooldown (10 min)
- ⏳ Remove individual buttons
- ⏳ Add batch button to UI
- ⏳ Timeline charts (3 assets)
- ⏳ Global risk map
- ⏳ Trading opportunities panel

---

## 🚀 NEXT STEPS:

1. **Test batch analysis** - Verify Sonar Pro call works
2. **Update cooldown** - Change to 10 minutes
3. **Remove individual buttons** - Clean up headline cards
4. **Add batch button** - In Discovery Stream below "AUTO MODE ACTIVE"
5. **Build timeline charts** - Install recharts, create component
6. **Build global map** - Install leaflet, add supply chain data
7. **Build trading panel** - Display 5 opportunities with details

**Ready to proceed with Phase 2!** 🎯
