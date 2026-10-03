const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const isCardLiked = (cardElement) => {
  return cardElement
    .querySelector(".card__like-button")
    .classList.contains("card__like-button_is-active");
};

export const updateCardLikes = (cardElement, likes, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const isLikedByUser = likes.some((user) => user._id === userId);

  likeButton.classList.toggle("card__like-button_is-active", isLikedByUser);
  likeCount.textContent = likes.length;
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete",
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  updateCardLikes(cardElement, data.likes, userId);

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(cardElement, data._id),
    );
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(cardElement, data._id),
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link }),
    );
  }

  return cardElement;
};
