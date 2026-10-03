/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  createCardElement,
  deleteCard,
  isCardLiked,
  updateCardLikes,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  removeCard,
  changeLikeCardStatus,
} from "./components/api.js";

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const logo = document.querySelector(".header__logo");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description",
);
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const cardsStatsModalWindow = document.querySelector(".popup_type_info");
const cardsStatsInfoList = cardsStatsModalWindow.querySelector(".popup__info");
const popularCardsList = cardsStatsModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document
  .getElementById("popup-info-definition-template")
  .content.querySelector(".popup__info-item");
const infoPreviewTemplate = document
  .getElementById("popup-info-user-preview-template")
  .content.querySelector(".popup__list-item");

const allPopups = document.querySelectorAll(".popup");

let currentUserId;

// Вспомогательные функции
const renderLoading = (buttonElement, isLoading, loadingText, defaultText) => {
  buttonElement.textContent = isLoading ? loadingText : defaultText;
};

const renderUserInfo = ({ name, about, avatar }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createInfoBadge = (text) => {
  const badge = infoPreviewTemplate.cloneNode(true);
  badge.textContent = text;
  return badge;
};

const getCardsStats = (cards) => {
  const ownerIds = new Set(cards.map((card) => card.owner._id));
  const likesCount = cards.reduce((sum, card) => sum + card.likes.length, 0);

  const likesByUser = new Map();
  cards.forEach((card) => {
    card.likes.forEach((user) => {
      const userStats = likesByUser.get(user._id);
      likesByUser.set(user._id, {
        name: user.name,
        count: userStats ? userStats.count + 1 : 1,
      });
    });
  });

  const likeChampion = Array.from(likesByUser.values()).reduce(
    (champion, user) =>
      !champion || user.count > champion.count ? user : champion,
    null,
  );

  const popularCards = [...cards]
    .sort(
      (firstCard, secondCard) =>
        secondCard.likes.length - firstCard.likes.length,
    )
    .slice(0, 3);

  return {
    usersCount: ownerIds.size,
    likesCount,
    maxLikesFromOne: likeChampion ? likeChampion.count : 0,
    likeChampionName: likeChampion ? likeChampion.name : "—",
    popularCards,
  };
};

// Обработчики
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardElement, cardId) => {
  changeLikeCardStatus(cardId, isCardLiked(cardElement))
    .then((cardData) => {
      updateCardLikes(cardElement, cardData.likes, currentUserId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  removeCard(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const createCard = (cardData) => {
  return createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
  });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileSubmitButton, true, "Сохранение...", "Сохранить");
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileSubmitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarSubmitButton, true, "Сохранение...", "Сохранить");
  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardSubmitButton, true, "Создание...", "Создать");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(createCard(cardData));
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardSubmitButton, false, "Создание...", "Создать");
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const stats = getCardsStats(cards);

      cardsStatsInfoList.replaceChildren(
        createInfoString("Всего пользователей:", stats.usersCount),
        createInfoString("Всего лайков:", stats.likesCount),
        createInfoString(
          "Максимально лайков от одного:",
          stats.maxLikesFromOne,
        ),
        createInfoString("Чемпион лайков:", stats.likeChampionName),
      );

      popularCardsList.replaceChildren(
        ...stats.popularCards.map((card) => createInfoBadge(card.name)),
      );

      openModalWindow(cardsStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Слушатели событий
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logo.addEventListener("click", handleLogoClick);

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

// Загрузка данных пользователя и карточек
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    renderUserInfo(userData);
    cards.forEach((cardData) => {
      placesWrap.append(createCard(cardData));
    });
  })
  .catch((err) => {
    console.log(err);
  });
