import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href='/' className='logo'>
            <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
            <p>Code Builders Connect</p>
        </Link>

        <ul>
            <Link href="/">Home</Link>
            <Link href="#events" className='scroll-smooth'>Events</Link>
            <Link href="/events/create">Create Event</Link>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
