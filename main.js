const gallery = document.querySelector(".recipes")
const fragment = document.createDocumentFragment();
recipes.forEach(recipe => {
    const card = createRecipeTemplate(recipe).getRecipeHTML();
    fragment.appendChild(card);
});

gallery.appendChild(fragment);