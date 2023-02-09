import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'

export type SelectOption = {
    label: string
    value: string | number
}

type SelectProps = {
    options: SelectOption[]
} & (SingleSelectProps | MultipleSelectProps)

type MultipleSelectProps = {
    multiple: true,
    value: SelectOption[],
    onChange: (value: SelectOption[]) => void
}

type SingleSelectProps = {
    multiple?: false
    value?: SelectOption
    onChange: (value: SelectOption | undefined) => void
} 

export function Select({multiple, value, onChange, options}: SelectProps){
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    function isOptionSelected(option: SelectOption){
        return multiple ? value.includes(option) : option === value;
    }

    function clearOption(){ //typescript nhận dạng value trong onchange là chuỗi hay single value dựa vô tham số ([] và undefined)
        multiple ? onChange([]) : onChange(undefined)
    }

    function selectOption(option: SelectOption){
        if(multiple){
            if(value.includes(option)){
                onChange(value.filter(o => o !== option))
            }else{
                onChange([...value, option])
            }
        } else {
            if(option !== value) onChange(option)
        }
    }

    useEffect(() => {
        if(isOpen) setHighlightedIndex(0)
    }, [isOpen])

    useEffect(() => {
        const handler = (e: any) => {
            if(e.target != containerRef.current) return;
            switch (e.code){
                case 'Enter':
                case 'Space':
                    setIsOpen(prev => !prev);
                    if(isOpen) selectOption(options[highlightedIndex])
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    if(!open){
                        setIsOpen(true);
                        break;
                    }

                    const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1);
                    if(newValue >= 0 && newValue < options.length){
                        setHighlightedIndex(newValue);
                    }
                    break;
                case 'Escape':
                    setIsOpen(false);
                    break;
            }
        }
        containerRef.current?.addEventListener('keydown', handler);

        return () => {
            containerRef.current?.removeEventListener('keydown', handler)
        }
    }, [isOpen, highlightedIndex, options])

    return (
        <div 
        onClick={() => {setIsOpen(prev => !prev);}}
        tabIndex={0} 
        className={styles.container}
        >
            <span className={styles.value}>{multiple ? value.map(v => (
                <button key={v.value} onClick={e => {
                    e.stopPropagation();
                    selectOption(v);
                }}
                className={styles['option-badge']}
                >{v.label}
                <span className={styles['remove-btn']}>&times;</span></button>
            )) : value?.label}</span>
            <button className={styles['clear-btn']} onClick={() => clearOption()}>&times;</button>
            <div className={styles.divider}></div>
            <div className={styles.caret}></div>
            <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
                {options.map((option, index) => (
                    <li 
                        onClick={e => {
                            e.stopPropagation();
                            selectOption(option);
                            setIsOpen(false);
                        }}
                        key={option.value} 
                        className={`${styles.option} 
                                    ${isOptionSelected(option) ? styles.selected : ""}
                                    ${index === highlightedIndex ? styles.highlighted : ""}`}
                        onMouseEnter = {() => setHighlightedIndex(index)}
                        >
                        {option.label}
                    </li>  
                ))}
            </ul>
        </div>
    )
}