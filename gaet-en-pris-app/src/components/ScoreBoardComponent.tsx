import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { TextField, ITextFieldStyles, Stack, PrimaryButton, Text, DetailsList, DetailsListLayoutMode, SelectionMode, IDetailsListStyles, IDetailsListProps } from '@fluentui/react';
import { StateContext } from "../App";
import { stat } from 'fs';

interface IScoreboardRows {
    key: number,
    name: string,
    diff: number,
    point: number
}

export const ScoreBoardComponent  = () => {
    const state = React.useContext(StateContext);
    const [columns, setColumns] = useState<string[][]>([]);
    const [teamNames, setTeamNames] = useState<string[]>([]);
    const [currentPoints, setCurrentPoints] = useState<IScoreboardRows[]>([]);
    const [totalPoints, setTotalPoints] = useState<IScoreboardRows[]>([]);
    const stackTokens = { childrenGap: 15 };


    const generateColumnFields = (roundNumb: number): JSX.Element[] => {
        let fieldList: JSX.Element[] = [];

        const storeValue = (columnNumb: number, rowNumb: number, v: string) => {
            let c = [...columns];
            if (!c[columnNumb]) {
                c[columnNumb] = [];
            }
            c[columnNumb][rowNumb] = v;
            setColumns(c);
        };

        for (let i=0; i < state.numberOfTeams; i++) {
            let e = 
                <TextField 
                    key={i}
                    value={columns[roundNumb] ? columns[roundNumb][i] : ""}
                    onChange={(e, v) => storeValue(roundNumb, i, v ?? "")}
                />
            fieldList.push(e);
        }
        return fieldList;
    };

    const generateColumnFieldsForNames = (): JSX.Element[] => {
        let fieldList: JSX.Element[] = [];

        const storeValue = (rowNumb: number, v: string) => {
            let tn = [...teamNames];
            tn[rowNumb] = v;
            setTeamNames(tn);
        };

        for (let i=0; i < state.numberOfTeams; i++) {
            let e = <TextField 
                        key={i}
                        value={teamNames[i] ?? ""}
                        onChange={(e, v) => storeValue(i, v ?? "")}
                    />
            fieldList.push(e);
        }
        return fieldList;
    };

    const generateRoundColumn = (roundNumber:number) => {
        const columnFields = generateColumnFields(roundNumber);

        const parseToNumb = (c: number, r: number) => {
            // debugger;
            if (!columns[c]) return 0;
            if (!columns[c][r]) return 0;
            if (isNaN(parseInt(columns[c][r])) ) return 0;
            return parseInt(columns[c][r]);
        }

        const parseToNumbOnArg = (numb: string) => {
            if (!numb) return 0;
            if (isNaN(parseInt(numb)) ) return 0;
            return parseInt(numb);
        }

        const groupBy = (xs: any[], key: any) => {
            return xs.reduce( (rv, x) => {
                rv[x[key]] = rv[x[key]] || [];
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
          };

        const computeGuesses = () => {
            let currentColumnFieldsDiffList = [];
            // let currentColumnFieldsDiffList1 = [];

            const correctPrice = parseToNumb(roundNumber, state.numberOfTeams);

            for (let [index, field] of columnFields.entries()) {
                const fieldVal = parseToNumbOnArg(field.props.value);
                const diff = Math.abs(fieldVal - correctPrice);
                // currentColumnFieldsDiffList.push([index, diff]);
                currentColumnFieldsDiffList.push({
                    index: index,
                    diff: diff
                });
            }
            
            console.log("trying to group stuff:")
            let grouped = groupBy(currentColumnFieldsDiffList, 'diff');
            
            console.log(grouped);
            let scoreboardRows: IScoreboardRows[] = [];

            let currentPoints = state.numberOfTeams;
            for (let [key, diffGroup] of Object.entries(grouped) as [any, any]) {
                console.log(`${key}: ${diffGroup}`);
                console.log(diffGroup);
                for (let {index, diff} of diffGroup) {
                    let teamName = teamNames[index];

                    scoreboardRows.push({
                        key: index,
                        name: teamName,
                        diff: diff,
                        point: currentPoints
                    })
                }
                console.log(diffGroup.length)
                currentPoints = currentPoints - diffGroup.length;
              }

            console.log("");
            console.log("Correct Price is: ", correctPrice);
            // currentColumnFieldsDiffList = currentColumnFieldsDiffList.sort( (a, b) => {
            //     return a[1]-b[1];
            // })


            // let displayTable: any = {};
            // for (let i=0; i < state.numberOfTeams; i++) {
            //     let point = state.numberOfTeams - i;
            //     let [index, diff] = currentColumnFieldsDiffList[i];
            //     let teamName = teamNames[index];


            //     displayTable[teamName] = {
            //         diff: diff,
            //         points: point,
            //     }

            //     scoreboardRows.push({
            //         key: i,
            //         name: teamName,
            //         diff: diff,
            //         point: point
            //     })

            // }


            scoreboardRows.sort( (a, b) => b.point - a.point);
            // console.table(scoreboardRows)
            setCurrentPoints([...scoreboardRows]);

            //compute total score

            let tp = totalPoints.map( row => {
                let cr = scoreboardRows.filter( r => r.name === row.name)[0];
                let currentDiff = cr.diff;
                let currentPoint = cr.point;
                row.diff = row.diff + currentDiff
                row.point = row.point + currentPoint
                return row;
            });

            tp.sort( (a, b) => b.point - a.point);

            if (tp.length === 0) {
                tp = scoreboardRows;
            }
            setTotalPoints([...tp]);

            // console.table(displayTable);
        };

        const storeValue = (columnNumb: number, rowNumb: number, v: string) => {
            let c = [...columns];
            if (!c[columnNumb]) {
                c[columnNumb] = [];
            }
            c[columnNumb][rowNumb] = v;
            setColumns(c);
        };

        return (
            <Stack tokens={stackTokens} style={{marginLeft: "20px"}} key={roundNumber}>
                <h3>Round{roundNumber+1}</h3>
                {columnFields}
                <TextField 
                    label={"Correct price"}
                    value={columns[roundNumber] ? columns[roundNumber][state.numberOfTeams] : ""}
                    onChange={(e, v) => storeValue(roundNumber, state.numberOfTeams, v ?? "")}
                />
                <PrimaryButton text="Calculate" onClick={computeGuesses} />
            </Stack>
        );
    };

    const generateRoundColumns = (): JSX.Element[] => {
        let columnList: JSX.Element[] = []
        for (let i=0; i < state.numberOfRounds; i++) {
            let e = generateRoundColumn(i);
            columnList.push(e);
        }
        return columnList;
    };

    const createScoreBoard = (allRoundColumns: JSX.Element[]) => {
        return [
            <Stack tokens={stackTokens} style={{marginLeft: "20px"}}>
                <h6>Team names</h6>
                {generateColumnFieldsForNames()}
            </Stack>,
            ...allRoundColumns
        ]
    };

    const scoreboard = createScoreBoard(generateRoundColumns());


    let _columns = [
        { key: 'column1', name: 'Team Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Diff', fieldName: 'diff', minWidth: 100, maxWidth: 300, isResizable: true },
        { key: 'column3', name: 'Points', fieldName: 'point', minWidth: 100, maxWidth: 300, isResizable: true },
    ];

    
    let _TotalColumns = [
        { key: 'column1', name: 'Team Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Total Diff', fieldName: 'diff', minWidth: 100, maxWidth: 300, isResizable: true },
        { key: 'column3', name: 'Total Points', fieldName: 'point', minWidth: 100, maxWidth: 300, isResizable: true },
    ];

      const resultTableStyle: Partial<IDetailsListStyles> = {
          root: {
            //   border: "1px solid black"
            // marginRight: "20px"
            // fontSize: "30px"
          }
      }

    return (
        <>
        <div style={{ display: "flex", marginTop: "-100px", marginBottom: "50px" }}>

            {/* TODO: lav rows eller lister her ... eller måske faktisk bare et grid så jeg kan have labels i toppen*/}
            {scoreboard}
        </div>
        <div style={{ display: "flex", marginTop: "100px", fontSize: "40px" }}>
            <DetailsList 
                styles={resultTableStyle}
                items={currentPoints}
                columns={_columns}
                setKey="none"
                selectionMode={SelectionMode.none}
                // setKey="multiple"
                // setKey="set"
                // layoutMode={DetailsListLayoutMode.justified}
                // selection={this._selection}
                // selectionPreservedOnEmptyClick={true}
                // ariaLabelForSelectionColumn="Toggle selection"
                // ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                // checkButtonAriaLabel="Row checkbox"
                // onItemInvoked={this._onItemInvoked}
            />
            <div style={ {width: "200px"} }/>
            <DetailsList
                items={totalPoints}
                // compact={isCompactMode}
                columns={_TotalColumns}
                selectionMode={SelectionMode.none}
                // getKey={this._getKey}
                setKey="none"
                // layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                // onItemInvoked={this._onItemInvoked}
            />
        </div>
        </>
    );
}