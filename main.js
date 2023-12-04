const gallery = document.querySelector(".recipes")
const tagsWrapper = document.querySelector(".tags")
const searchBar = document.querySelector(".search-bar input")

let tags = []
let displayedRecipes = []

// Function to display recipes
const displayRecipes = recipes => {
    displayedRecipes = []
    const fragment = document.createDocumentFragment()

    for (const recipe of recipes) {
        const card = createRecipeTemplate(recipe).getRecipeHTML()
        displayedRecipes.push(card)
        fragment.appendChild(card)
    }

    gallery.innerHTML = ""
    gallery.appendChild(fragment)
    updateRecipesCounter()
}

// Function to update recipes counter
const updateRecipesCounter = () => {
    const counter = document.querySelector(".recipes_count")

    if (displayedRecipes.length === 0) {
        counter.textContent = "Aucune recette"
        gallery.textContent = "Aucune recette"
    } else {
        counter.textContent = `${displayedRecipes.length.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false
        })} ${displayedRecipes.length === 1 ? "recette" : "recettes"}`
    }
}

// Display initial recipes
displayRecipes(recipes)

// Function to capitalize the first letter of a string
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

// Function to update tags
const updateTags = () => {
    tagsWrapper.innerHTML = ""
    const fragment = document.createDocumentFragment()

    for (const tag of tags) {
        const tagElem = document.createElement("div")
        tagElem.className = "tag-item"
        tagElem.dataset.type = tag.type
        tagElem.dataset.value = tag.name.toLowerCase()
        tagElem.innerHTML = `
            ${capitalize(tag.name)}
            <svg fill="none" height="13" viewBox="0 0 14 13" width="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5"  stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2.16667"/>
            </svg>`
        fragment.appendChild(tagElem)

        // Remove Tag
        tagElem.addEventListener("click", () => removeTag(tag))
    }

    tagsWrapper.appendChild(fragment)

    updateFilteredRecipes()
}

// Removes a tag from the tags array and update displayed tags.
const removeTag = tag => {
    const tagIndex = tags.indexOf(tag)

    if (tagIndex !== -1) {
        tags.splice(tagIndex, 1)

        const tagTypeElement = document.querySelector(`#${tag.type}`)
        const optionItems = tagTypeElement.querySelectorAll(".option-item")

        const matchingOption = Array.from(optionItems).find(option => {
            return option.dataset.value.toLowerCase() === tag.name.toLowerCase()
        })

        if (matchingOption) {
            matchingOption.style.display = "flex"
        }

        updateTags()
        handleSearch()
    }
}

//  Updates the dropdown filters based on the filtered recipes
const updateFilters = filteredRecipes => {
    let filteredOptions = getAllIngredientsAndTools(filteredRecipes)
    let categorizedTags = {
        ingredients: [],
        appliances: [],
        utensils: [],
    }
    for (const tag of tags) {
        const category = categorizedTags[tag.type + "s"]
        category[category.length] = tag.name.toLowerCase()
    }

    const filterCategory = function (category, options) {
        const filteredItems = []
        for (const option of options) {
            if (!categorizedTags[category].includes(option.toLowerCase())) {
                filteredItems[filteredItems.length] = option
            }
        }
        return filteredItems
    }

    const filteredIngredients = filterCategory("ingredients", filteredOptions.ingredients)
    const filteredAppliances = filterCategory("appliances", filteredOptions.appliances)
    const filteredUtensils = filterCategory("utensils", filteredOptions.utensils)

    dropdown1.updateDisplayedOptions(filteredIngredients)
    dropdown2.updateDisplayedOptions(filteredAppliances)
    dropdown3.updateDisplayedOptions(filteredUtensils)
}

// Function to extract tags from a recipe
const getRecipeTags = recipe => {
    const ingredients = []
    for (const ingredient of recipe.ingredients) {
        ingredients.push(ingredient.ingredient.toLowerCase())
    }
    const utensils = []
    for (const utensil of recipe.utensils) {
        utensils.push(utensil.toLowerCase())
    }

    return new Set([...ingredients, recipe.appliance.toLowerCase(), ...utensils])
}

// Function to update recipes based on filters
const updateFilteredRecipes = () => {
    const filteredRecipes = []
    for (const recipe of recipes) {
        const recipeTags = getRecipeTags(recipe)
        let matchTags = true

        for (const tag of tags) {
            if (!recipeTags.has(tag.name.toLowerCase())) {
                matchTags = false
                break
            }
        }

        if (matchTags) {
            filteredRecipes.push(recipe)
        }
    }

    displayRecipes(filteredRecipes)
    updateFilters(filteredRecipes)

}

// Function to handle search
function handleSearch() {
    const searchQuery = searchBar.value.toLowerCase().trim()
    if (searchQuery) {
        const searchResults = []
        for (const recipe of recipes) {
            const recipeTags = getRecipeTags(recipe)
            if (recipe.name.toLowerCase().includes(searchQuery) ||
                Array.from(recipeTags).some(tag => tag.includes(searchQuery))) {
                searchResults.push(recipe)
            }
        }

        displayRecipes(searchResults)
        updateFilters(searchResults)
    }
}

// Event listener for the search bar
searchBar.addEventListener("input", handleSearch)

// Extracts unique ingredients, appliances, and utensils from a list of recipes.
function getAllIngredientsAndTools(recipes) {
    let ingredientsSet = new Set()
    let appliancesSet = new Set()
    let utensilsSet = new Set()

    for (const recipe of recipes) {
        for (const ingredient of recipe.ingredients) {
            ingredientsSet.add(ingredient.ingredient.toLowerCase())
        }

        appliancesSet.add(recipe.appliance.toLowerCase())

        for (const utensil of recipe.utensils) {
            utensilsSet.add(utensil.toLowerCase())
        }
    }

    const ingredients = []
    for (const str of Array.from(ingredientsSet)) {
        ingredients.push(capitalize(str))
    }
    const appliances = []
    for (const str of Array.from(appliancesSet)) {
        appliances.push(capitalize(str))
    }
    const utensils = []
    for (const str of Array.from(utensilsSet)) {
        utensils.push(capitalize(str))
    }

    return {ingredients, appliances, utensils}
}

const {ingredients, appliances, utensils} = getAllIngredientsAndTools(recipes)

const dropdown1 = new Dropdown(document.querySelector("#ingredient"), Array.from(ingredients))
dropdown1.init()
const dropdown2 = new Dropdown(document.querySelector("#appliance"), Array.from(appliances))
dropdown2.init()
const dropdown3 = new Dropdown(document.querySelector("#utensil"), Array.from(utensils))
dropdown3.init()