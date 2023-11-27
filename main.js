const gallery = document.querySelector(".recipes")

recipes.forEach(recipe => {
    let recipeDOM = createRecipeTemplate(recipe).getRecipeHTML()
    gallery.appendChild(recipeDOM)
})