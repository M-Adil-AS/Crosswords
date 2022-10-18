function coordsToCellNo(X,Y){
    return ((Y/50)*10) + (X/50)
}

function cellNoToX(cellNo){
    return (cellNo%10) * 50
}

function cellNoToY(cellNo){
    return Math.trunc(cellNo/10) * 50
}

function marginLeft(block){
    return Number(block.style.marginLeft.split('px')[0])
}

function marginTop(block){
    return Number(block.style.marginTop.split('px')[0])
}

function invertDirection(direction){
    return direction == 'horizontal' ? 'vertical' : 'horizontal'
}

function blocks(){
    return document.querySelectorAll('.block')
}

function triggerCountdown(){
    clearInterval(countdownID)
    countdown.innerHTML = '300'
    countdownID = setInterval(()=>{
        countdown.innerHTML = Number(countdown.innerHTML) - 1
        countdown.innerHTML == '0' && gameOver()
    },1000)
}

function gameOver(){
    bgMusic.pause()
    new Audio('game over.wav').play()
    inputString.innerHTML = ''
    blocks().forEach(block => block.style.transform = 'scale(1)')
    clearInterval(countdownID)
    keysAllowed = false
}

function placeResult(result,direction,X,Y){
    let html = ''
    let occupied = []
    let cellNo = coordsToCellNo(X,Y)

    for(let i=0; i<result.length; i++){
        occupied.push(direction=='horizontal' ? cellNo+i : cellNo+(i*10))
        let style = `margin-left:${direction=='horizontal'?X+(i*50):X}px; margin-top:${direction=='vertical'?Y+(i*50):Y}px; transform:scale(0);`
        html += `<div class='block' style='${style}'>${result[i].toUpperCase()}</div>`
    }
    container.insertAdjacentHTML('beforeend', html)

    return occupied
}

function getResults(){
    let results
    let alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

    do{
        sample = ''
        results = []
        let toBeSelectedFrom = [...alphabets]
    
        for(let i=0; i<6; i++){
            let randomAlphabet = toBeSelectedFrom[Math.floor(Math.random() * toBeSelectedFrom.length)]
            sample = sample + randomAlphabet
            toBeSelectedFrom.splice(toBeSelectedFrom.indexOf(randomAlphabet),1)
        }

        sample = sample.split('').sort().join('')

        alphaKeys.forEach((elem,index)=>{
            elem.querySelector('b').innerHTML = sample[index].toUpperCase()
        })
        
        dictionary.forEach((word)=>{
            let test = true
            alphabets.forEach((alphabet)=>{
                if(word.includes(alphabet) && !sample.includes(alphabet)){
                    test = false
                }
            })
        
            if(test){
                if(word.length>2 && word.length<7){
                    results.push(word)
                }
            }
        })
    }
    while(results.length<=15 || results.filter(result => result.length>=5).length>3)
    
    results.sort((a, b) => b.length - a.length)
    results = results.slice(0,15)
    return results
}

function placeFirstResult(results){
    let X = 150
    let Y = 150
    let direction = ['horizontal','vertical'][Math.floor(Math.random() * 2)]
    
    data.push({result:results[0], direction:direction, occupied: placeResult(results[0],direction,X,Y)})
}

function placeResults(){
    data = []
    blocks().forEach(block => block.remove())
    cells.forEach(cell => cell.style.opacity = '1')

    let results = getResults()
    placeFirstResult(results)
    let remaining = results.slice(1)

    for(let iterations=0; iterations<15; iterations++){
        if(data.length==10){
            break
        }

        let placements = []
        Array.from(remaining[0]).forEach((alphabet_A,index_A)=>{
            data.forEach((object)=>{
                Array.from(object.result).forEach((alphabet_B,index_B)=>{
                    if(alphabet_A==alphabet_B){
                        let intersectCellNo = object.occupied[index_B]
                        let direction = invertDirection(object.direction)
                        let firstAlphabetCellNo = direction=='horizontal' ? intersectCellNo-index_A : intersectCellNo-(index_A*10)
                        placements.push({result:remaining[0], direction, firstAlphabetCellNo})
                    }
                })
            })
        })

        let validPlacement = false
        for(let i=0; i<placements.length; i++){
            let X = cellNoToX(placements[i].firstAlphabetCellNo)
            let Y = cellNoToY(placements[i].firstAlphabetCellNo)
            delete placements[i].firstAlphabetCellNo
            placements[i].occupied = placeResult(remaining[0], placements[i].direction, X, Y)

            let outOfGrid = false
            blocks().forEach((block)=>{
                if(marginLeft(block)<0 || marginLeft(block)>450 || marginTop(block)<0 || marginTop(block)>450){
                    outOfGrid = true
                }
            })

            let test = true         
            if(!outOfGrid){
                let gridWords = getGridWords()
                gridWords.forEach((word)=>{
                    if(!results.slice(0,data.length+1).includes(word)){
                        test = false
                    }
                })

                if(new Set(gridWords).size!=gridWords.length || gridWords.length!=results.slice(0,data.length+1).length){
                    test = false
                }
            }

            if(test && !outOfGrid){
                validPlacement = true
                data.push(placements[i])
                remaining.shift()
                break
            }
            else{
                for(let j=0; j<remaining[0].length; j++){
                    container.lastChild.remove()
                }
            }
        }

        if(!validPlacement){
            results.push(results.splice(results.indexOf(remaining[0]),1)[0])
            remaining.push(remaining.shift())
        }
    }

    arrangeBlocks()
    cells.forEach((cell,cellNo)=>{
        if(!data.find(object => object.occupied.includes(cellNo))){
            cell.style.opacity = '0'
        }
    })
}

function getGridWords(){
    let gridWords = []
    for(let row=0; row<=9; row++){
        let word = ''
        for(column=0; column<=9; column++){
            if(getBlocksAtCellNo((row*10)+column).length){
                word = word + getBlocksAtCellNo((row*10)+column)[0].innerHTML
                if(word.length>1 && column==9){
                    gridWords.push(word.toLowerCase())
                }
            }
            else{
                word.length>1 && gridWords.push(word.toLowerCase())
                word = ''
            }
        }
    }

    for(let column=0; column<=9; column++){
        let word = ''
        for(row=0; row<=9; row++){
            if(getBlocksAtCellNo((row*10)+column).length){
                word = word + getBlocksAtCellNo((row*10)+column)[0].innerHTML
                if(word.length>1 && row==9){
                    gridWords.push(word.toLowerCase())
                }
            }
            else{
                word.length>1 && gridWords.push(word.toLowerCase())
                word = ''
            }
        }
    }
    return gridWords
}

function getBlocksAtCellNo(cellNo){
    let blocksFound = []
    blocks().forEach((block)=>{
        if(marginLeft(block)==cellNoToX(cellNo) && marginTop(block)==cellNoToY(cellNo)){
            blocksFound.push(block)
        }
    })
    return blocksFound
}

function arrangeBlocks(){
    let min_X = +Infinity
    let max_X = -Infinity
    let min_Y = +Infinity
    let max_Y = -Infinity

    blocks().forEach((block)=>{
        min_X = Math.min(min_X, marginLeft(block))
        max_X = Math.max(max_X, marginLeft(block))
        min_Y = Math.min(min_Y, marginTop(block))
        max_Y = Math.max(max_Y, marginTop(block))
    })

    let emptyColumnsOnLS = min_X/50
    let emptyColumnsOnRS = (450-max_X)/50

    data.forEach((object)=>{
        object.occupied = object.occupied.map(cellNo => cellNo+Math.trunc((emptyColumnsOnRS-emptyColumnsOnLS)/2))
    })
    blocks().forEach((block)=>{
        block.style.marginLeft = `${marginLeft(block)+(Math.trunc((emptyColumnsOnRS-emptyColumnsOnLS)/2)*50)}px`
    })

    let emptyRowsOnUS = min_Y/50
    let emptyRowsOnBS = (450-max_Y)/50

    data.forEach((object)=>{
        object.occupied = object.occupied.map(cellNo => cellNo+(Math.trunc((emptyRowsOnBS-emptyRowsOnUS)/2)*10))
    })
    blocks().forEach((block)=>{
        block.style.marginTop = `${marginTop(block)+(Math.trunc((emptyRowsOnBS-emptyRowsOnUS)/2)*50)}px`
    })
}