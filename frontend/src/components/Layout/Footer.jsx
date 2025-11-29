import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ()=>{
    return (
        <div className='footer sticky bottom-0'>
            <h4 className='text-center'>
            All Rights Reserved &copy; Resume-Master
            </h4>
            <p className='text-center mt-3'>
            <Link to="/about">About</Link>|
            <Link to="/contact">contact</Link>|
            <Link to="/policy"> policy</Link>
            </p>

            
        </div>
    )
};

export default Footer;