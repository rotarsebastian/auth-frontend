import React, { useState, useRef } from 'react';
import classes from './WhoAmI.module.css';
import img from '../../assets/me.png';
import behance from '../../assets/behance.svg';
import github from '../../assets/github.svg';
import linkedin from '../../assets/linkedin.svg';
import gmail from '../../assets/gmail.svg';
import facebook from '../../assets/facebook.svg';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const WhoAmI = () => {
    const contact = [
        { img: behance, name: 'Behance', color: 'invert(29%) sepia(53%) saturate(3769%) hue-rotate(214deg) brightness(101%) contrast(103%)', data: 'https://www.behance.net/rotarsebastian' }, 
        { img: github, name: 'GitHub', color: 'invert(7%) sepia(5%) saturate(358%) hue-rotate(316deg) brightness(96%) contrast(95%)', data: 'https://github.com/rotarsebastian/' }, 
        { img: linkedin, name: 'LinkedIn', color: 'invert(33%) sepia(20%) saturate(5030%) hue-rotate(175deg) brightness(96%) contrast(101%)', data: 'https://www.linkedin.com/in/mihail-sebastian-rotar-92464a101/' }, 
        { img: gmail, name: 'Gmail', color: 'invert(37%) sepia(15%) saturate(7134%) hue-rotate(341deg) brightness(88%) contrast(85%)', data: 'rotar.seby1@gmail.com' },
        { img: facebook, name: 'Facebook', color: 'invert(30%) sepia(54%) saturate(4522%) hue-rotate(208deg) brightness(104%) contrast(90%)', data: 'https://www.facebook.com/RotarSebastian1/' },
    ];

    const [showEmail, setShowEmail] = useState({ value: false, animation: '' });
    const [tooltipEmail, setTooltipEmail] = useState('Click to copy');
    const [clipboardVal] = useState('rotar.seby1@gmail.com');
    const emailEl = useRef(null);

    const handleRedirect = link => {
        if(link.includes('http')) window.open(link, '_blank');
        else {
            emailEl.current.style.display = 'block';
            setShowEmail({ value: !showEmail.value, animation: !showEmail.value ? ' animated fadeInLeft' : ' animated fadeOutRight' });
        }
    }

    const handleOnCopy = () => {
        setShowEmail({ value: !showEmail.value, animation: !showEmail.value ? ' animated fadeInLeft' : ' animated fadeOutRight' });
        setTooltipEmail('Copied');
        setTimeout(() => { setTooltipEmail('remove'); }, 800);
        setTimeout(() => { setTooltipEmail('Click to copy'); }, 2000);
    }

    return(
        <div className={classes.Container}>
            <h2>Welcome to SoftCloud!</h2>
            <img className={classes.MyImage} src={img} alt="me" onClick={() => handleRedirect(contact[0].data)} />
            <p>Sebastian Rotar - the owner of my one-person-based company - SoftCloud.</p>
            <p>Fullstack Developer implementing modern code using modern technologies with passion.</p>
            <div className={classes.ContactContainer}>
                { contact.map((brand, index) => {
                    return (
                        <div key={index} className={classes.BrandContainer} onClick={() => handleRedirect(brand.data)}>
                            <img className={classes.BrandIcon} style={{filter: brand.color}} src={brand.img} alt={brand + '-icon'} />
                            <span>{brand.name}</span>
                        </div>
                    )
                }) }
            </div>
            <CopyToClipboard text={clipboardVal} onCopy={handleOnCopy}>
                <div ref={emailEl} className={classes.Email + showEmail.animation}>{clipboardVal}</div>
            </CopyToClipboard>
            { tooltipEmail !== 'remove' ? <div className={classes.Tooltip}>{tooltipEmail}</div> : undefined }
        </div>
    )
}

export default WhoAmI;
