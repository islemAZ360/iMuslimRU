'use client';

import React from 'react';
import styles from './Loaders.module.css';

export function HamsterLoader() {
    return (
        <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className={styles.wheelAndHamster}>
            <div className={styles.wheel}></div>
            <div className={styles.hamster}>
                <div className={styles.hamsterBody}>
                    <div className={styles.hamsterHead}>
                        <div className={styles.hamsterEar}></div>
                        <div className={styles.hamsterEye}></div>
                        <div className={styles.hamsterNose}></div>
                    </div>
                    <div className={styles.hamsterLimbFr}></div>
                    <div className={styles.hamsterLimbFl}></div>
                    <div className={styles.hamsterLimbBr}></div>
                    <div className={styles.hamsterLimbBl}></div>
                    <div className={styles.hamsterTail}></div>
                </div>
            </div>
            <div className={styles.spoke}></div>
        </div>
    );
}
