// Quick test of slug generation
const createEventSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-')   // Replace multiple - with single -
    .replace(/^-+|-+$/g, '')  // Trim - from start and end
    .trim();
};

console.log('Test slugs:');
console.log('Ladies DJ Night => ' + createEventSlug('Ladies DJ Night'));
console.log('Test Event & Special-Chars => ' + createEventSlug('Test Event & Special-Chars'));
console.log('Empty input => "' + createEventSlug('') + '"');
console.log('Special chars !@#$% => "' + createEventSlug('Event !@#$% Test') + '"');
