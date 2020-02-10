console.log('SCRIPTS');
const colorBlocks = document.querySelectorAll('.colorBlock');

const handleClick = event => {
  const colorBlock = event.currentTarget;
  const primaryColorBlock = event.currentTarget.parentElement.querySelector(
    '.primary'
  );
  const color = colorBlock.dataset.color;
  primaryColorBlock.style.color = color;
  // console.log('HANDLE CLICK', event.currentTarget, color);
};

colorBlocks.forEach(colorBlock => {
  colorBlock.addEventListener('click', handleClick);
});
