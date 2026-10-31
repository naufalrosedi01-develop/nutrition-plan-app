// ==========================================================================
// CONFIGURATION & GLOBAL CONSTANTS
// ==========================================================================
const USDA_API_KEY = 'khwkNwd87HJ6TWzKRccj9Ld7QkrWkTKKRC9zGknk';
const STORAGE_KEY = 'NUTRITION_MEAL_RECORDS';

// Helper function to get today's date formatted as YYYY-MM-DD
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================================================
// DOM ELEMENT SELECTIONS
// ==========================================================================
const foodInput = document.getElementById('foodInput');
const btnSearch = document.getElementById('btnSearch');
const searchResultsList = document.getElementById('searchResultsList');
const alertBox = document.getElementById('alertBox');
const dashboardDateBadge = document.getElementById('dashboardDateBadge');

// Daily totals display elements
const dailyCaloriesDisplay = document.getElementById('dailyCaloriesDisplay');
const dailyProteinDisplay = document.getElementById('dailyProteinDisplay');
const dailyCarbsDisplay = document.getElementById('dailyCarbsDisplay');
const dailyFatDisplay = document.getElementById('dailyFatDisplay');

// Analysis elements
const btnAnalyzeNutrition = document.getElementById('btnAnalyzeNutrition');
const analysisResultContainer = document.getElementById('analysisResultContainer');

// 4-Meal sections
const breakfastCalories = document.getElementById('breakfastCalories');
const breakfastProtein = document.getElementById('breakfastProtein');
const breakfastCarbs = document.getElementById('breakfastCarbs');
const breakfastFat = document.getElementById('breakfastFat');
const breakfastItems = document.getElementById('breakfastItems');

const lunchCalories = document.getElementById('lunchCalories');
const lunchProtein = document.getElementById('lunchProtein');
const lunchCarbs = document.getElementById('lunchCarbs');
const lunchFat = document.getElementById('lunchFat');
const lunchItems = document.getElementById('lunchItems');

const snackCalories = document.getElementById('snackCalories');
const snackProtein = document.getElementById('snackProtein');
const snackCarbs = document.getElementById('snackCarbs');
const snackFat = document.getElementById('snackFat');
const snackItems = document.getElementById('snackItems');

const dinnerCalories = document.getElementById('dinnerCalories');
const dinnerProtein = document.getElementById('dinnerProtein');
const dinnerCarbs = document.getElementById('dinnerCarbs');
const dinnerFat = document.getElementById('dinnerFat');
const dinnerItems = document.getElementById('dinnerItems');

function showAlert(message, isError = true) {
  alertBox.textContent = message;
  alertBox.className = isError ? 'alert alert-error' : 'alert alert-success';
  alertBox.style.display = 'block';
  setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
}

// Global variable to retain today's accumulated macro numbers for analysis
let todayNutritionalTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };

// ==========================================================================
// 1. CALCULATE AND SHOW FOOD INTAKE TODAY ONLY (RESETS AT 12:00 AM)
// ==========================================================================
function loadDailyDashboard() {
  const allRecords = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const todayStr = getTodayDateString();

  // Set date badge
  const now = new Date();
  dashboardDateBadge.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // STRICT FILTER: Only load records created for TODAY
  const records = allRecords.filter(item => (item.date || todayStr) === todayStr);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const mealSummary = {
    Breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] },
    Lunch:     { calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] },
    Snack:     { calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] },
    Dinner:    { calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] }
  };

  records.forEach(item => {
    const cal = Number(item.calories) || 0;
    const pro = Number(item.protein) || 0;
    const carb = Number(item.carbs) || 0;
    const fat = Number(item.fat) || 0;

    totalCalories += cal;
    totalProtein += pro;
    totalCarbs += carb;
    totalFat += fat;

    const category = item.category || 'Snack';
    if (mealSummary[category]) {
      mealSummary[category].calories += cal;
      mealSummary[category].protein += pro;
      mealSummary[category].carbs += carb;
      mealSummary[category].fat += fat;
      mealSummary[category].foods.push({ name: item.name, calories: cal });
    }
  });

  // Store totals for the nutrition analyzer feature
  todayNutritionalTotals = {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    count: records.length
  };

  // Render totals on DOM
  dailyCaloriesDisplay.textContent = `${totalCalories.toFixed(0)} kcal`;
  dailyProteinDisplay.textContent = `${totalProtein.toFixed(1)} g`;
  dailyCarbsDisplay.textContent = `${totalCarbs.toFixed(1)} g`;
  dailyFatDisplay.textContent = `${totalFat.toFixed(1)} g`;

  function renderMealSection(data, calsEl, proEl, carbEl, fatEl, listEl) {
    calsEl.textContent = `${data.calories.toFixed(0)} kcal`;
    proEl.textContent = `${data.protein.toFixed(1)}g`;
    carbEl.textContent = `${data.carbs.toFixed(1)}g`;
    fatEl.textContent = `${data.fat.toFixed(1)}g`;

    if (data.foods.length === 0) {
      listEl.innerHTML = '<li style="color:#aaa;">No meals logged yet</li>';
    } else {
      listEl.innerHTML = '';
      data.foods.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${f.name}</span><strong>${f.calories} kcal</strong>`;
        listEl.appendChild(li);
      });
    }
  }

  renderMealSection(mealSummary.Breakfast, breakfastCalories, breakfastProtein, breakfastCarbs, breakfastFat, breakfastItems);
  renderMealSection(mealSummary.Lunch, lunchCalories, lunchProtein, lunchCarbs, lunchFat, lunchItems);
  renderMealSection(mealSummary.Snack, snackCalories, snackProtein, snackCarbs, snackFat, snackItems);
  renderMealSection(mealSummary.Dinner, dinnerCalories, dinnerProtein, dinnerCarbs, dinnerFat, dinnerItems);
}

// ==========================================================================
// 2. DAILY MACRONUTRIENT ANALYSIS & TOMORROW'S SUGGESTION
// ==========================================================================
function performNutritionAnalysis() {
  const { calories, protein, carbs, fat, count } = todayNutritionalTotals;

  if (count === 0 || calories === 0) {
    analysisResultContainer.style.display = 'block';
    analysisResultContainer.innerHTML = `
      <div style="background: #fff; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; color: #991b1b; text-align: center;">
        ⚠️ <strong>No meal records logged for today yet!</strong><br>
        <span style="font-size: 13px; color: #64748b;">Please log your meals in the "Food Intake Log" tab first to generate your daily analysis.</span>
      </div>
    `;
    return;
  }

  // Calculate percentage contributions
  const totalGrams = protein + carbs + fat;
  const pPct = totalGrams > 0 ? Math.round((protein / totalGrams) * 100) : 0;
  const cPct = totalGrams > 0 ? Math.round((carbs / totalGrams) * 100) : 0;
  const fPct = totalGrams > 0 ? Math.round((fat / totalGrams) * 100) : 0;

  // Analysis conclusions
  let macroStatus = '';
  let tomorrowAdvice = '';

  if (pPct < 20) {
    macroStatus = 'Low Protein Intake: Your protein contribution is below the recommended 20-30% range.';
    tomorrowAdvice = 'Consider adding high-protein sources such as eggs, grilled chicken breast, silken tofu, or greek yogurt to your Breakfast and Lunch tomorrow.';
  } else if (fPct > 35) {
    macroStatus = 'High Fat Ratio: Over 35% of your food intake volume consists of fats.';
    tomorrowAdvice = 'Opt for steamed, grilled, or boiled meal preparations tomorrow rather than deep-fried items. Increase leafy vegetables and whole fruits.';
  } else if (cPct > 60) {
    macroStatus = 'Carbohydrate Dominant: Your daily energy came primarily from carbohydrates.';
    tomorrowAdvice = 'Substitute refined carbs with complex sources (oats, brown rice) and ensure each meal contains a portion of lean protein to stabilize energy.';
  } else {
    macroStatus = 'Optimal Balance: Excellent macronutrient distribution meeting general dietary guidelines.';
    tomorrowAdvice = 'Maintain this steady balance tomorrow! Ensure consistent water intake (2 to 2.5 litres) and keep up meal timing consistency.';
  }

  analysisResultContainer.style.display = 'block';
  analysisResultContainer.innerHTML = `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 5px solid #10b981; border-radius: 14px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); text-align: left;">
      <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 8px;">📊 Daily Macro Breakdown Analysis</h3>
      <div style="display: flex; gap: 15px; margin-bottom: 12px; font-size: 13px; color: #475569;">
        <span>Carbohydrates: <strong>${cPct}%</strong> (${carbs.toFixed(1)}g)</span> |
        <span>Protein: <strong>${pPct}%</strong> (${protein.toFixed(1)}g)</span> |
        <span>Fats: <strong>${fPct}%</strong> (${fat.toFixed(1)}g)</span>
      </div>
      <p style="font-size: 14px; color: #334155; margin-bottom: 12px; line-height: 1.4;">
        <strong>Assessment:</strong> ${macroStatus}
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <strong style="color: #059669; font-size: 13px;">💡 Actionable Suggestion for Tomorrow:</strong>
        <p style="font-size: 13px; color: #475569; margin-top: 4px; line-height: 1.4;">${tomorrowAdvice}</p>
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. SEARCH USDA FOOD ITEMS (100g)
// ==========================================================================
function extractUsdaNutrients(foodNutrients) {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  foodNutrients.forEach(nutrient => {
    const name = nutrient.nutrientName ? nutrient.nutrientName.toLowerCase() : '';
    const val = parseFloat(nutrient.value) || 0;
    if (name.includes('energy') && nutrient.unitName === 'KCAL') calories = Math.round(val);
    else if (name === 'protein') protein = parseFloat(val.toFixed(1));
    else if (name.includes('carbohydrate')) carbs = parseFloat(val.toFixed(1));
    else if (name.includes('total lipid (fat)')) fat = parseFloat(val.toFixed(1));
  });
  return { calories, protein, carbs, fat };
}

async function searchFoodItems() {
  const query = foodInput.value.trim();
  if (!query) {
    showAlert('Please enter a food keyword to search.');
    return;
  }

  searchResultsList.style.display = 'block';
  searchResultsList.innerHTML = '<div style="padding: 12px; color: #7f8c8d;">Connecting to USDA FoodData Central API...</div>';

  try {
    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=6&api_key=${USDA_API_KEY}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API server returned status ${response.status}`);

    const data = await response.json();
    if (!data.foods || data.foods.length === 0) {
      searchResultsList.innerHTML = '<div style="padding: 12px; color: #e74c3c;">No food items found matching your keyword.</div>';
      return;
    }

    searchResultsList.innerHTML = '';
    data.foods.forEach(food => {
      const name = food.description || 'Unnamed Food';
      const nutrients = extractUsdaNutrients(food.foodNutrients || []);

      const itemElement = document.createElement('div');
      itemElement.className = 'search-item';
      itemElement.innerHTML = `
        <span class="item-name">${name} (100g)</span>
        <span class="item-badge">${nutrients.calories} kcal →</span>
      `;

      itemElement.addEventListener('click', () => {
        const productData = {
          product_name: `${name} (100g)`,
          nutriments: {
            'energy-kcal_100g': nutrients.calories,
            proteins_100g: nutrients.protein,
            carbohydrates_100g: nutrients.carbs,
            fat_100g: nutrients.fat
          }
        };
        sessionStorage.setItem('SELECTED_FOOD_ITEM', JSON.stringify(productData));
        window.location.href = 'food-details.html';
      });

      searchResultsList.appendChild(itemElement);
    });
  } catch (error) {
    searchResultsList.innerHTML = `<div style="padding: 12px; color: #c0392b;">Connection error: ${error.message}</div>`;
  }
}

// Event Listeners
btnSearch.addEventListener('click', searchFoodItems);
foodInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchFoodItems(); });
btnAnalyzeNutrition.addEventListener('click', performNutritionAnalysis);

document.addEventListener('DOMContentLoaded', loadDailyDashboard);