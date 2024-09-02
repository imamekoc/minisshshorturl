const Footer = () => {
  return (
    <div className='supports-backdrop-blur:bg-background/60 z-20 w-full shadow bg-background/95 backdrop-blur'>
      <div className='mx-8 flex h-14 items-center'>
        <small className='text-muted-foreground'>
          Created by Minicut.link{' '}
          <a
            className='hover:underline'
            href='https://minicut.link/'
            aria-label='MiniSSH'
            target='_blank'
            rel='noreferrer'
          >
            Part of MiniSSH
          </a>{' '}
          &copy; {new Date().getFullYear()}. All right reserved.
        </small>
      </div>
    </div>
  );
};

export default Footer;
