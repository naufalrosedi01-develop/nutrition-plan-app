// ==========================================================================
// 1. OOP CLASS: MealPlanRecommendation
// Represents a single structured meal timing recommendation entity
// ==========================================================================
class MealPlanRecommendation {
  constructor(icon, mealTiming, mealName, calories, protein, carbs, fat, advice) {
    this.icon = icon;             // Emoji / icon for visual representation
    this.mealTiming = mealTiming; // Breakfast, Lunch, Afternoon Tea, Dinner
    this.mealName = mealName;     // Concrete food suggestion
    this.calories = calories;     // Energy in kcal
    this.protein = protein;       // Protein in grams
    this.carbs = carbs;           // Carbs in grams
    this.fat = fat;               // Fat in grams
    this.advice = advice;         // Nutritional benefit tip
  }
}

// ==========================================================================
// 2. OOP CLASS: UserProfile
// Encapsulates biometric properties, metabolic math & conditional recommendations
// ==========================================================================
class UserProfile {
  constructor(gender, weight, height, age, activityFactor, goal) {
    this.gender = gender;
    this.weight = parseFloat(weight);
    this.height = parseFloat(height);
    this.age = parseInt(age, 10);
    this.activityFactor = parseFloat(activityFactor);
    this.goal = goal; // 'lose_500g', 'stay', 'gain_500g'
  }

  // Validate positive numeric inputs
  isValid() {
    return (
      !isNaN(this.weight) && !isNaN(this.height) && !isNaN(this.age) &&
      this.weight > 0 && this.height > 0 && this.age > 0
    );
  }

  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
  calculateBMR() {
    if (this.gender === 'male') {
      return (10 * this.weight) + (6.25 * this.height) - (5 * this.age) + 5;
    } else {
      return (10 * this.weight) + (6.25 * this.height) - (5 * this.age) - 161;
    }
  }

  // Calculate Total Daily Energy Expenditure (TDEE)
  calculateTDEE() {
    return this.calculateBMR() * this.activityFactor;
  }

  // Calculate Daily Target Calories for 30-Day Goal
  calculateTargetCalories() {
    const tdee = this.calculateTDEE();
    // 500g body weight equates to ~3850 kcal. Spread over 30 days = ~130 kcal/day offset
    if (this.goal === 'lose_500g') {
      return Math.max(tdee - 130, 1200); // Enforce safety floor of 1200 kcal/day
    } else if (this.goal === 'gain_500g') {
      return tdee + 130;
    }
    return tdee; // 'stay' (maintain weight)
  }

  // Generate 4-Meal Plan Suggestions mapped to user goal
  getFourMealPlanRecommendations() {
    let mealPlans = [];

    if (this.goal === 'lose_500g') {
      // Weight loss plan: Lean protein, high dietary fiber, controlled glycemic load
      mealPlans = [
        new MealPlanRecommendation(
          '🌅', 'Breakfast (Morning)',
          '2 Boiled Eggs + 1 Slice Wholewheat Bread & Cucumber',
          220, 15.0, 16.0, 11.0,
          'High protein to stimulate satiety hormones and prevent mid-morning hunger.'
        ),
        new MealPlanRecommendation(
          '☀️', 'Lunch (Afternoon)',
          'Grilled Chicken Breast (120g) + Steamed Broccoli + Brown Rice (100g)',
          380, 36.0, 34.0, 6.0,
          'Lean protein paired with fibrous greens preserves lean muscle during caloric deficit.'
        ),
        new MealPlanRecommendation(
          '🥪', 'Afternoon Tea / Snack',
          '1 Medium Green Apple + Hot Green Tea (Unsweetened)',
          80, 0.5, 21.0, 0.3,
          'Low calorie, antioxidant-rich snack that stabilizes blood glucose without sugar spikes.'
        ),
        new MealPlanRecommendation(
          '🍲', 'Dinner (Night)',
          'Steamed White Fish Fillet (120g) + Clear Vegetable Broth & Silken Tofu',
          260, 28.0, 12.0, 5.0,
          'Light, easily digestible protein supporting tissue recovery without sleep disruption.'
        )
      ];
    } else if (this.goal === 'gain_500g') {
      // Weight gain plan: Nutrient-dense complex carbohydrates and healthy unsaturated fats
      mealPlans = [
        new MealPlanRecommendation(
          '🌅', 'Breakfast (Morning)',
          'Rolled Oats (60g) with Full Cream Milk, Banana & 1 Tbsp Peanut Butter',
          450, 18.0, 68.0, 14.0,
          'Dense complex carbs replenish glycogen and sustain physical energy demands.'
        ),
        new MealPlanRecommendation(
          '☀️', 'Lunch (Afternoon)',
          'Pan-seared Salmon (150g) + White Rice (150g) + Stir-fried Asian Greens',
          560, 38.0, 55.0, 18.0,
          'Rich in Omega-3 fatty acids and complete proteins supporting healthy muscle hypertrophy.'
        ),
        new MealPlanRecommendation(
          '🥪', 'Afternoon Tea / Snack',
          'Roasted Mixed Nuts (30g) + 1 Fresh Banana',
          280, 7.0, 32.0, 15.0,
          'Clean calorie booster supplying potassium and heart-healthy monounsaturated fats.'
        ),
        new MealPlanRecommendation(
          '🍲', 'Dinner (Night)',
          'Baked Chicken Thigh (140g) + Mashed Sweet Potato (150g) + Mixed Salad',
          480, 34.0, 48.0, 14.0,
          'Provides slow-release carbohydrates and restorative amino acids for overnight growth.'
        )
      ];
    } else {
      // Weight maintenance: Balanced macronutrient split (approx 50% Carbs, 25% Protein, 25% Fat)
      mealPlans = [
        new MealPlanRecommendation(
          '🌅', 'Breakfast (Morning)',
          '2-Egg Vegetable Omelette (Tomato & Spinach) + 1 Slice Wholemeal Toast',
          280, 16.0, 20.0, 12.0,
          'Balanced morning profile maintaining steady cognitive focus and energy levels.'
        ),
        new MealPlanRecommendation(
          '☀️', 'Lunch (Afternoon)',
          'Stir-fried Chicken / Beef Strips with Mixed Veggies & Fragrant Rice (120g)',
          450, 30.0, 45.0, 12.0,
          'Sustained fuel source supplying essential micronutrients and steady daytime stamina.'
        ),
        new MealPlanRecommendation(
          '🥪', 'Afternoon Tea / Snack',
          'Low-fat Greek Yogurt (100g) with 1 Tsp Honey & Chia Seeds',
          140, 10.0, 15.0, 4.0,
          'High calcium and beneficial probiotics promoting digestive tract health.'
        ),
        new MealPlanRecommendation(
          '🍲', 'Dinner (Night)',
          'Grilled Chicken Fillet (120g) + Steamed Sweet Corn & Long Beans',
          350, 28.0, 32.0, 8.0,
          'Balanced and wholesome dinner preserving metabolic balance without excess energy.'
        )
      ];
    }

    return mealPlans;
  }

  // Get explanatory summary for chosen goal
  getGoalSummary() {
    if (this.goal === 'lose_500g') {
      return {
        badge: 'Lose 500g in 1 Month',
        detail: 'Targeting a moderate daily deficit of 130 kcal (~3,900 kcal/month) for steady, non-restrictive fat loss.'
      };
    } else if (this.goal === 'gain_500g') {
      return {
        badge: 'Gain 500g in 1 Month',
        detail: 'Targeting a controlled daily surplus of 130 kcal (~3,900 kcal/month) for gradual, healthy weight gain.'
      };
    } else {
      return {
        badge: 'Maintain Weight (Stay)',
        detail: 'Daily energy intake perfectly matches your expenditure (TDEE) to maintain current weight.'
      };
    }
  }
}

// ==========================================================================
// 3. DOM SELECTION & EVENT HANDLING
// ==========================================================================
const btnCalculate = document.getElementById('btnCalculate');
const genderInput = document.getElementById('gender');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');
const activityInput = document.getElementById('activityLevel');
const dietGoalInput = document.getElementById('dietGoal');
const calcAndSuggestionResult = document.getElementById('calcAndSuggestionResult');
const alertBox = document.getElementById('alertBox');

// Display feedback alert
function showAlert(message, isError = true) {
  alertBox.textContent = message;
  alertBox.className = isError ? 'alert alert-error' : 'alert alert-success';
  alertBox.style.display = 'block';
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}

// Perform calculation and render modern cards
function handleCalculation() {
  const profile = new UserProfile(
    genderInput.value,
    weightInput.value,
    heightInput.value,
    ageInput.value,
    activityInput.value,
    dietGoalInput.value
  );

  // Validate inputs
  if (!profile.isValid()) {
    showAlert('Error: Please enter valid positive numbers for weight, height, and age.');
    return;
  }

  const bmr = profile.calculateBMR();
  const tdee = profile.calculateTDEE();
  const targetCalories = profile.calculateTargetCalories();
  const mealPlans = profile.getFourMealPlanRecommendations();
  const goalSummary = profile.getGoalSummary();

  // Build 4-Meal Suggestion Cards HTML
  let mealCardsHtml = '';
  mealPlans.forEach(meal => {
    mealCardsHtml += `
      <div class="calc-meal-card">
        <div class="calc-meal-card-top">
          <div class="calc-meal-card-title">
            <span>${meal.icon}</span>
            <span>${meal.mealTiming}</span>
          </div>
          <span class="calc-meal-cals-badge">${meal.calories} kcal</span>
        </div>

        <div class="calc-meal-food-name">🍽️ ${meal.mealName}</div>

        <div class="calc-meal-macros-pill">
          <span>Protein: <strong>${meal.protein}g</strong></span>
          <span>Carbs: <strong>${meal.carbs}g</strong></span>
          <span>Fat: <strong>${meal.fat}g</strong></span>
        </div>

        <p class="calc-meal-tip">💡 <em>${meal.advice}</em></p>
      </div>
    `;
  });

  // Render comprehensive output panel
  calcAndSuggestionResult.innerHTML = `
    <div class="calc-result-panel">
      <!-- Dark Modern Metric Summary Banner -->
      <div class="calc-summary-banner">
        <div class="calc-summary-box">
          <div class="label">Base BMR</div>
          <div class="value">${bmr.toFixed(0)} <span style="font-size: 14px; font-weight: normal;">kcal</span></div>
        </div>
        <div class="calc-summary-box">
          <div class="label">Maintenance (TDEE)</div>
          <div class="value">${tdee.toFixed(0)} <span style="font-size: 14px; font-weight: normal;">kcal</span></div>
        </div>
        <div class="calc-summary-box highlight">
          <div class="label">Daily Calorie Target</div>
          <div class="value">${targetCalories.toFixed(0)} <span style="font-size: 14px; font-weight: normal;">kcal</span></div>
        </div>
      </div>

      <!-- Selected Goal Info Pill -->
      <div class="calc-goal-pill">
        <strong>🎯 Objective: ${goalSummary.badge}</strong>
        <p>${goalSummary.detail}</p>
      </div>

      <!-- 4-Meal Plan Deck -->
      <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 16px; font-weight: 800;">
        🥗 Recommended 4-Meal Schedule & Macro Breakdown
      </h3>

      <div class="calc-meal-deck">
        ${mealCardsHtml}
      </div>
    </div>
  `;

  showAlert('Target calories and 4-meal plan generated successfully!', false);
}

// Event listener registration
btnCalculate.addEventListener('click', handleCalculation);