// ==========================================================================
// CONFIGURATION & GLOBAL CONSTANTS
// ==========================================================================
// Official USDA FoodData Central API Key and LocalStorage key
const USDA_API_KEY = 'khwkNwd87HJ6TWzKRccj9Ld7QkrWkTKKRC9zGknk';
const STORAGE_KEY = 'NUTRITION_MEAL_RECORDS';

// Helper function to return today's local date formatted as YYYY-MM-DD
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Current active viewing date in the diary (defaults to today)
let currentSelectedDate = getTodayDateString();

// ==========================================================================
// 1. OOP BASE CLASS: FoodItem (Entity Model for Standard Logged Foods)
// ==========================================================================
class FoodItem {
  constructor(id, name, calories, protein, carbs, fat, category, date) {
    this.id = id || Date.now().toString(); // Generate unique timestamp ID
    this.name = name;
    this.calories = parseFloat(calories) || 0;
    this.protein = parseFloat(protein) || 0;
    this.carbs = parseFloat(carbs) || 0;
    this.fat = parseFloat(fat) || 0;
    this.category = category || 'Breakfast';
    this.date = date || getTodayDateString(); // Defaults to today's date
  }

  // Calculate total macro mass in grams
  getTotalMacroWeight() {
    return this.protein + this.carbs + this.fat;
  }
}

// ==========================================================================
// 2. OOP SUBCLASS: CustomMealItem (Fulfills Topic 4: Inheritance Requirement)
// Inherits from FoodItem using 'extends' and 'super()'
// ==========================================================================
class CustomMealItem extends FoodItem {
  constructor(id, name, calories, protein, carbs, fat, category, date, isCustom = true) {
    // Invoke parent constructor via super()
    super(id, name, calories, protein, carbs, fat, category, date);
    this.isCustom = isCustom; // Subclass-specific property flag
  }

  // Polymorphic summary method
  getItemSummary() {
    return `${this.name} (${this.calories} kcal) [Logged via USDA/Custom]`;
  }
}

// ==========================================================================
// 3. OOP CLASS: FoodLogManager (CRUD & Aggregation Handler)
// Manages a collection of FoodItem/CustomMealItem instances in Local Storage
// ==========================================================================
class FoodLogManager {
  constructor(storageKey = STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  // READ OPERATION: Deserialize records and restore OOP class instances
  getAllRecords() {
    const rawData = localStorage.getItem(this.storageKey);
    if (!rawData) return [];
    try {
      const parsed = JSON.parse(rawData);
      // Re-instantiate as CustomMealItem to maintain class prototypes
      return parsed.map(item => new CustomMealItem(
        item.id, item.name, item.calories, item.protein, item.carbs, item.fat, item.category, item.date, item.isCustom
      ));
    } catch (e) {
      return [];
    }
  }

  // Filter records by specific date (YYYY-MM-DD)
  getRecordsByDate(dateString) {
    const all = this.getAllRecords();
    return all.filter(item => (item.date || getTodayDateString()) === dateString);
  }

  // SERIALIZATION: Save array back to Local Storage
  saveAll(records) {
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  // CREATE OPERATION: Add a new meal record
  addRecord(foodItem) {
    const records = this.getAllRecords();
    records.push(foodItem);
    this.saveAll(records);
  }

  // UPDATE OPERATION: Edit an existing meal record
  updateRecord(updatedItem) {
    const records = this.getAllRecords();
    const index = records.findIndex(r => r.id === updatedItem.id);
    if (index !== -1) {
      records[index] = updatedItem;
      this.saveAll(records);
      return true;
    }
    return false;
  }

  // DELETE OPERATION: Remove record by ID
  deleteRecord(id) {
    let records = this.getAllRecords();
    records = records.filter(r => r.id !== id);
    this.saveAll(records);
  }

  // READ OPERATION: Find record by ID
  getRecordById(id) {
    return this.getAllRecords().find(r => r.id === id);
  }
}

// Instantiate OOP Log Manager
const logManager = new FoodLogManager();

// ==========================================================================
// 4. DOM ELEMENT SELECTIONS
// ==========================================================================
const btnCalendarTrigger = document.getElementById('btnCalendarTrigger');
const diaryDatePicker = document.getElementById('diaryDatePicker');
const displayDateLabel = document.getElementById('displayDateLabel');

const mealModal = document.getElementById('mealModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelEdit = document.getElementById('btnCancelEdit');

const formHeading = document.getElementById('formHeading');
const editRecordId = document.getElementById('editRecordId');
const modalRecordDate = document.getElementById('modalRecordDate');
const foodSearchInput = document.getElementById('foodSearchInput');
const btnSearchApiFood = document.getElementById('btnSearchApiFood');
const apiSearchResults = document.getElementById('apiSearchResults');

const mealNameInput = document.getElementById('mealName');
const mealCaloriesInput = document.getElementById('mealCalories');
const mealProteinInput = document.getElementById('mealProtein');
const mealCarbsInput = document.getElementById('mealCarbs');
const mealFatInput = document.getElementById('mealFat');
const mealCategoryInput = document.getElementById('mealCategory');

const btnSaveRecord = document.getElementById('btnSaveRecord');
const crudAlertBox = document.getElementById('crudAlertBox');

function showCrudAlert(message, isError = false) {
  crudAlertBox.textContent = message;
  crudAlertBox.className = isError ? 'alert alert-error' : 'alert alert-success';
  crudAlertBox.style.display = 'block';
  setTimeout(() => {
    crudAlertBox.style.display = 'none';
  }, 3500);
}

// ==========================================================================
// 5. CALENDAR DATE SELECTOR CONTROLLER
// ==========================================================================
function updateDateDisplay() {
  const todayStr = getTodayDateString();
  if (currentSelectedDate === todayStr) {
    displayDateLabel.textContent = 'Today';
  } else {
    const parts = currentSelectedDate.split('-');
    const dateObj = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
    displayDateLabel.textContent = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  diaryDatePicker.value = currentSelectedDate;
}

if (btnCalendarTrigger && diaryDatePicker) {
  btnCalendarTrigger.addEventListener('click', () => {
    if (typeof diaryDatePicker.showPicker === 'function') {
      diaryDatePicker.showPicker();
    } else {
      diaryDatePicker.click();
    }
  });

  diaryDatePicker.addEventListener('change', (e) => {
    if (e.target.value) {
      currentSelectedDate = e.target.value;
      updateDateDisplay();
      renderDiaryCards();
    }
  });
}

// ==========================================================================
// 6. MODAL FORM OPEN & CLOSE CONTROLLER
// ==========================================================================
window.openLogModalForCategory = function(categoryName) {
  resetForm();
  mealCategoryInput.value = categoryName;
  modalRecordDate.value = currentSelectedDate;
  formHeading.textContent = `Log Food for ${categoryName}`;
  mealModal.style.display = 'flex';
};

function closeModal() {
  mealModal.style.display = 'none';
  resetForm();
}

btnCloseModal.addEventListener('click', closeModal);
btnCancelEdit.addEventListener('click', closeModal);

// ==========================================================================
// 7. USDA FOODDATA CENTRAL API INTEGRATION (STANDARDIZED PER 100g)
// ==========================================================================
function extractUsdaNutrients(foodNutrients) {
  let calories = 0, protein = 0, carbs = 0, fat = 0;

  foodNutrients.forEach(nutrient => {
    const name = nutrient.nutrientName ? nutrient.nutrientName.toLowerCase() : '';
    const val = parseFloat(nutrient.value) || 0;

    if (name.includes('energy') && nutrient.unitName === 'KCAL') {
      calories = Math.round(val);
    } else if (name === 'protein') {
      protein = parseFloat(val.toFixed(1));
    } else if (name.includes('carbohydrate')) {
      carbs = parseFloat(val.toFixed(1));
    } else if (name.includes('total lipid (fat)')) {
      fat = parseFloat(val.toFixed(1));
    }
  });

  return { calories, protein, carbs, fat };
}

async function searchFoodForForm() {
  const query = foodSearchInput.value.trim();
  if (!query) {
    showCrudAlert('Please type a food keyword to search.', true);
    return;
  }

  apiSearchResults.style.display = 'block';
  apiSearchResults.innerHTML = '<div style="padding: 10px; color: #64748b;">Searching USDA FoodData Central...</div>';

  try {
    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${USDA_API_KEY}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error(`API returned status ${res.status}`);

    const data = await res.json();
    if (!data.foods || data.foods.length === 0) {
      apiSearchResults.innerHTML = '<div style="padding: 10px; color: #ef4444;">No foods found matching your query.</div>';
      return;
    }

    apiSearchResults.innerHTML = '';
    data.foods.forEach(food => {
      const originalName = food.description || 'Selected Food';
      const nameWithPortion = `${originalName} (100g)`;
      const nutrients = extractUsdaNutrients(food.foodNutrients || []);

      const itemDiv = document.createElement('div');
      itemDiv.className = 'search-item';
      itemDiv.innerHTML = `
        <span class="item-name">${nameWithPortion}</span>
        <span class="item-badge">${nutrients.calories} kcal</span>
      `;

      itemDiv.addEventListener('click', () => {
        mealNameInput.value = nameWithPortion;
        mealCaloriesInput.value = nutrients.calories;
        mealProteinInput.value = nutrients.protein;
        mealCarbsInput.value = nutrients.carbs;
        mealFatInput.value = nutrients.fat;

        apiSearchResults.style.display = 'none';
        foodSearchInput.value = '';
        showCrudAlert(`Loaded "${nameWithPortion}" (standard 100g serving).`);
      });

      apiSearchResults.appendChild(itemDiv);
    });

  } catch (err) {
    apiSearchResults.innerHTML = `<div style="padding: 10px; color: #ef4444;">API Error: ${err.message}</div>`;
  }
}

// ==========================================================================
// 8. RENDER DIARY CARDS FOR SELECTED DATE
// ==========================================================================
function renderDiaryCards() {
  const records = logManager.getRecordsByDate(currentSelectedDate);

  const categories = {
    Breakfast: { subtitle: document.getElementById('breakfastSubtitle'), stats: document.getElementById('breakfastMacroStats'), container: document.getElementById('breakfastItemsContainer'), items: [] },
    Lunch:     { subtitle: document.getElementById('lunchSubtitle'),     stats: document.getElementById('lunchMacroStats'),     container: document.getElementById('lunchItemsContainer'),     items: [] },
    Snack:     { subtitle: document.getElementById('snackSubtitle'),     stats: document.getElementById('snackMacroStats'),     container: document.getElementById('snackItemsContainer'),     items: [] },
    Dinner:    { subtitle: document.getElementById('dinnerSubtitle'),    stats: document.getElementById('dinnerMacroStats'),    container: document.getElementById('dinnerItemsContainer'),    items: [] }
  };

  records.forEach(item => {
    const cat = item.category || 'Snack';
    if (categories[cat]) {
      categories[cat].items.push(item);
    }
  });

  Object.keys(categories).forEach(cat => {
    const data = categories[cat];
    const items = data.items;

    if (items.length === 0) {
      data.subtitle.textContent = 'No meals logged yet';
      data.stats.textContent = '0 cal • C 0% • F 0% • P 0%';
      data.container.innerHTML = '';
      return;
    }

    let totalCals = 0, totalCarbs = 0, totalFat = 0, totalProtein = 0;

    items.forEach(it => {
      totalCals += Number(it.calories) || 0;
      totalCarbs += Number(it.carbs) || 0;
      totalFat += Number(it.fat) || 0;
      totalProtein += Number(it.protein) || 0;
    });

    const firstName = items[0].name.split(',')[0].replace(' (100g)', '');
    const moreCount = items.length - 1;
    data.subtitle.textContent = moreCount > 0 ? `${firstName} and ${moreCount} more` : firstName;

    const totalGrams = totalCarbs + totalFat + totalProtein;
    let cPct = 0, fPct = 0, pPct = 0;
    if (totalGrams > 0) {
      cPct = Math.round((totalCarbs / totalGrams) * 100);
      fPct = Math.round((totalFat / totalGrams) * 100);
      pPct = Math.round((totalProtein / totalGrams) * 100);
    }

    data.stats.textContent = `${totalCals} cal  •  C ${cPct}%  F ${fPct}%  P ${pPct}%`;

    let itemsHtml = '';
    items.forEach(it => {
      itemsHtml += `
        <div class="diary-food-row">
          <div>
            <strong>${it.name}</strong>
            <div class="diary-food-meta">${it.calories} kcal &nbsp;|&nbsp; P: ${it.protein}g &nbsp; C: ${it.carbs}g &nbsp; F: ${it.fat}g</div>
          </div>
          <div class="diary-food-actions">
            <button class="btn-item-action btn-item-edit" onclick="prepareEditRecord('${it.id}')">Edit</button>
            <button class="btn-item-action btn-item-delete" onclick="deleteRecord('${it.id}')">Delete</button>
          </div>
        </div>
      `;
    });
    data.container.innerHTML = itemsHtml;
  });
}

// ==========================================================================
// 9. CRUD CREATE & UPDATE ACTIONS (CREATES CustomMealItem INSTANCES)
// ==========================================================================
function handleSaveRecord() {
  const name = mealNameInput.value.trim();
  const calories = parseFloat(mealCaloriesInput.value);
  const protein = parseFloat(mealProteinInput.value) || 0;
  const carbs = parseFloat(mealCarbsInput.value) || 0;
  const fat = parseFloat(mealFatInput.value) || 0;
  const category = mealCategoryInput.value;
  const recordDate = modalRecordDate.value || currentSelectedDate;
  const currentId = editRecordId.value;

  if (!name || isNaN(calories)) {
    showCrudAlert('Please select a food item or enter valid calories.', true);
    return;
  }

  if (currentId) {
    // Instantiate CustomMealItem subclass
    const updatedItem = new CustomMealItem(currentId, name, calories, protein, carbs, fat, category, recordDate, true);
    logManager.updateRecord(updatedItem);
    showCrudAlert('Meal record updated successfully!');
  } else {
    // Instantiate CustomMealItem subclass
    const newItem = new CustomMealItem(null, name, calories, protein, carbs, fat, category, recordDate, true);
    logManager.addRecord(newItem);
    showCrudAlert('Meal saved to diary successfully!');
  }

  closeModal();
  renderDiaryCards();
}

window.prepareEditRecord = function (id) {
  const record = logManager.getRecordById(id);
  if (record) {
    editRecordId.value = record.id;
    mealNameInput.value = record.name;
    mealCaloriesInput.value = record.calories;
    mealProteinInput.value = record.protein;
    mealCarbsInput.value = record.carbs;
    mealFatInput.value = record.fat;
    mealCategoryInput.value = record.category;
    modalRecordDate.value = record.date || currentSelectedDate;

    formHeading.textContent = 'Edit Food Intake Record';
    btnSaveRecord.textContent = 'Update Record';
    mealModal.style.display = 'flex';
  }
};

window.deleteRecord = function (id) {
  if (confirm('Are you sure you want to delete this meal record?')) {
    logManager.deleteRecord(id);
    showCrudAlert('Record deleted successfully.');
    renderDiaryCards();
  }
};

function resetForm() {
  editRecordId.value = '';
  foodSearchInput.value = '';
  mealNameInput.value = '';
  mealCaloriesInput.value = '';
  mealProteinInput.value = '';
  mealCarbsInput.value = '';
  mealFatInput.value = '';
  mealCategoryInput.value = 'Breakfast';
  modalRecordDate.value = currentSelectedDate;

  formHeading.textContent = 'Log Food Intake';
  btnSaveRecord.textContent = 'Save to Diary';
  apiSearchResults.style.display = 'none';
}

btnSearchApiFood.addEventListener('click', searchFoodForForm);
foodSearchInput.addEventListener('keydown', (e) => { 
  if (e.key === 'Enter') searchFoodForForm(); 
});
btnSaveRecord.addEventListener('click', handleSaveRecord);

document.addEventListener('DOMContentLoaded', () => {
  updateDateDisplay();
  renderDiaryCards();
});