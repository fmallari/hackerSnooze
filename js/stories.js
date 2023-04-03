"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  console.log("storyList", storyList);
  $storiesLoadingMsg.remove();

  const storyPage = putStoriesOnPage();
  console.log(storyPage);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

// COMPLETE FUNCTION

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

// if a user is logged in, show favorite/not-favorite star
const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// MAKE DELETE BUTTON HTML FOR STORY

function getDeleteBtnHTML() {
  return `
  <span class="trash-can">
  <i class="fas fa-trash-alt"></i>
  </span>`;
}

// MAKE FAVORITE/NONE-FAVORITE STAR FOR STORY

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
  <i class="${starType} fa-star"></i> 
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
console.log($allStoriesList);
  $allStoriesList.show();
}

// HANDLE DELETING A STORY

async function deleteStory(evt) {
  console.log("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

// RE-GENERATE STORY LIST
  await pushUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

// HANDLE SUBMITTING NEW STORY FORM

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

// COLLECT ALL INFORMATION FROM FORM

const title = $("create-title").val();
const url = $("#create-url").val();
const author = $("#create-author").val();
const username = currentUser.username 
const storyData = {title, url, author, username};

const story = await storyList.addStory(currentUser, storyData);

const $story = generateStoryMarkup(story);
$allStoriesList.prepend($story);

//HIDE THE FORM AND RESET IT 

$submitForm.slideUp("slow");
$submitForm.trigger("reset");

}

$submitForm.on("submit", submitNewStory);

// FUNCTIONALITY FOR LIST OF USER'S OWN STORIES

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if(currentUser.ownStories.length === 0) {
    $ownStories.append("<h5> No stories added by user yet</h5>");
  } else {

// loop through all users stories and generate HTML for them 
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

// HANDLE FAVORITE/NONE FAVORITE STORY

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closestLi("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find( s => s.storyId === storyId);

// SEE IF THE ITEM IS ALREADY FAVORITED (CHECKING BY PRESENCE OF STAR)
if ($tgt.hasClass("fas")) {
  // CURRENTLY A FAVORITE: REMOVE FROM USER'S FAV LIST AND CHANGE STAR
  await currentUser.removeFavorite(story);
  $tgt.closest("i").toggleClass("fas far");
}
}

$storiesList.on("click", ".star", toggleStoryFavorite);