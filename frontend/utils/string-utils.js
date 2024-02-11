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

const classToLabel = {
  'c0': 'Safe driving', 
  'c1': 'Texting - Right', 
  'c2': 'Talking on the phone - Right', 
  'c3': 'Texting - Left', 
  'c4': 'Talking on the phone - Left', 
  'c5': 'Operating the radio', 
  'c6': 'Drinking', 
  'c7': 'Reaching behind', 
  'c8': 'Hair and makeup', 
  'c9': 'Talking to passenger' 
}

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
  
};

export const mapClassToLabel = (classif) => {
  return classToLabel[classif]
};
