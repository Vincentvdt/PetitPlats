const gallery = document.querySelector(".recipes")
const tagsWrapper = document.querySelector(".tags")
const searchBar = document.querySelector(".search-bar")

let tags = []

let displayedRecipes = [...recipes]

// Function to capitalize the first letter of a string
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
const displayNoRecipe = () => {
    const input = searchBar.querySelector("input")
    const searchQuery = input.value.toLowerCase().trim()
    const counterElement = document.querySelector(".recipes_count")
    let message = `Aucune recette ne contient ‘${searchQuery}’ vous pouvez chercher «tarte aux pommes », « poisson », etc.`
    counterElement.textContent = "00 recette"
    gallery.textContent = message
    displayedRecipes = recipes
}
// Function to display the recipes
const displayRecipes = recipes => {

    const fragment = document.createDocumentFragment()

    recipes.forEach(recipe => {
        const card = createRecipeTemplate(recipe).getRecipeHTML()
        fragment.appendChild(card)
    })

    gallery.innerHTML = ""
    gallery.appendChild(fragment)
    displayedRecipes = recipes
    const counterElement = document.querySelector(".recipes_count")
    const noRecipeFound = displayedRecipes.length === 0
    // Update recipes counter
    if (noRecipeFound) {
        displayNoRecipe()
    } else {
        const pluralSuffix = displayedRecipes.length === 1 ? "" : "s"
        const formattedCount = displayedRecipes.length.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false
        })
        counterElement.textContent = `${formattedCount} recette${pluralSuffix}`
    }

    updateDropdownOptions()
}

// Function to update tags
const updateTags = () => {

    tagsWrapper.innerHTML = ""
    const fragment = document.createDocumentFragment()

    tags.forEach(tag => {
        const tagElem = document.createElement("button")
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
    })

    tagsWrapper.appendChild(fragment)
    filterRecipes()
}

// Removes a tag from the tags array and update displayed tags.
const removeTag = tag => {
    const tagIndex = tags.indexOf(tag)
    console.log(tagIndex)

    if (tagIndex !== -1) {
        tags.splice(tagIndex, 1)
        updateTags()
    }

}

const filterRecipes = () => {
    let filteredRecipes = recipes
    const input = searchBar.querySelector("input")
    const searchQuery = input.value.toLowerCase().trim()
    let recipeTags = []
    if (tags.length) {
        filteredRecipes = filteredRecipes.filter(recipe => {
            recipeTags = getRecipeTags(recipe)
            return tags.every(tag => Array.from(recipeTags).includes(tag.name))
        })
    }

    if (searchQuery.length >= 3) {
        filteredRecipes = filteredRecipes.filter(recipe => {
            recipeTags = getRecipeTags(recipe, "ingredients")
            return (
                recipe.name.toLowerCase().includes(searchQuery) ||
                recipe.description.toLowerCase().includes(searchQuery) ||
                Array.from(recipeTags).some(tag => tag.includes(searchQuery))
            )
        })
    }
    displayRecipes(filteredRecipes)
}

searchBar.addEventListener("input", e => {
    e.preventDefault()
    filterRecipes()
})

searchBar.addEventListener("submit", e => {
    e.preventDefault()
    filterRecipes()
    searchBar.querySelector("input").value = ""
})

//  Updates the dropdown filters based on the filtered recipes
const updateDropdownOptions = () => {
    if (displayedRecipes.length <= 0 && !tags.length) {
        displayedRecipes = recipes
    }
    const extractedOptions = getAllRecipesInformation(displayedRecipes)

    const categorizedTags = {
        ingredients: tags.filter(tag => tag.type === "ingredient").map(tag => tag.name.toLowerCase()),
        appliances: tags.filter(tag => tag.type === "appliance").map(tag => tag.name.toLowerCase()),
        utensils: tags.filter(tag => tag.type === "utensil").map(tag => tag.name.toLowerCase())
    }

    const filterCategory = (category, options) => Array.from(options).filter(option => !categorizedTags[category].includes(option.toLowerCase()))

    const filteredIngredients = filterCategory("ingredients", extractedOptions.ingredients)
    const filteredAppliances = filterCategory("appliances", extractedOptions.appliances)
    const filteredUtensils = filterCategory("utensils", extractedOptions.utensils)

    dropdownIngredient.updateDisplayedOptions(filteredIngredients)
    dropdownAppliance.updateDisplayedOptions(filteredAppliances)
    dropdownUtensil.updateDisplayedOptions(filteredUtensils)
}

// Function to extract tags from a recipe
const getRecipeTags = (recipe, singleType = null) => {
    const {ingredients, appliances, utensils} = extractSingleRecipeInformation(recipe)

    let recipeTags

    switch (singleType) {
        case "ingredients":
            recipeTags = Array.from(ingredients)
            break
        case "appliances":
            recipeTags = Array.from(appliances)
            break
        case "utensils":
            recipeTags = Array.from(utensils)
            break
        default:
            recipeTags = [...ingredients, ...appliances, ...utensils]
    }

    return new Set(recipeTags.map(tag => tag.toLowerCase()))
}

// Extracts unique ingredients, appliances, and utensils from a list of recipes.
function getAllRecipesInformation(recipes) {
    return recipes.reduce((result, recipe) => {
        const singleRecipeInfo = extractSingleRecipeInformation(recipe)

        result.ingredients = new Set([...result.ingredients, ...singleRecipeInfo.ingredients])
        result.appliances.add(recipe.appliance)
        result.utensils = new Set([...result.utensils, ...singleRecipeInfo.utensils])

        return result
    }, {
        ingredients: new Set(),
        appliances: new Set(),
        utensils: new Set(),
    })
}

function extractSingleRecipeInformation(recipe) {
    const ingredientsSet = new Set()
    const appliancesSet = new Set()
    const utensilsSet = new Set()

    recipe.ingredients.forEach(ingredient => ingredientsSet.add(ingredient.ingredient))
    appliancesSet.add(recipe.appliance)
    recipe.utensils.forEach(utensil => utensilsSet.add(utensil))

    return {
        ingredients: ingredientsSet,
        appliances: appliancesSet,
        utensils: utensilsSet,
    }
}

// Display initial recipes and init dropdowns
const {ingredients, appliances, utensils} = getAllRecipesInformation(displayedRecipes)

const dropdownIngredient = new Dropdown(document.querySelector("#ingredient"), Array.from(ingredients))
dropdownIngredient.init()
const dropdownAppliance = new Dropdown(document.querySelector("#appliance"), Array.from(appliances))
dropdownAppliance.init()
const dropdownUtensil = new Dropdown(document.querySelector("#utensil"), Array.from(utensils))
dropdownUtensil.init()
displayRecipes(displayedRecipes)



