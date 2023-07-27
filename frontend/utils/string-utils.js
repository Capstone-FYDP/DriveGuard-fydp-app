const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const pluralize = (text, count, suffix = 's') => {
  if (count === 1) {
    return text;
  } else {
    return text + suffix;
  }
};

export const humanDateString = (date) => {
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const humanTimeString = (date) => {
  const suffix = date.getHours() >= 12 ? 'PM' : 'AM';
  const hours = ((date.getHours() + 11) % 12) + 1;
  return `${hours}:${date.getMinutes().toString().padStart(2, "0")} ${suffix}`;
};

export const humanDateOfBirthString = (date) => {
  return `${
    months[date.getUTCMonth()]
  } ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

export const capitalizeWords = (phrase) => {
  const words = phrase.split(" ");

  for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ")
  
}
