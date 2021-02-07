import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { TextField, ITextFieldStyles, Stack, PrimaryButton, Text } from '@fluentui/react';
import { StateContext } from "../App";
import { stat } from 'fs';

export const ScoreBoardComponent  = () => {
    const state = React.useContext(StateContext);
    const [columns, setColumns] = useState<string[][]>([]);
    const [teamNames, setTeamNames] = useState<string[]>([]);
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

        const computeGuesses = () => {
            let resultList = [];

            const correctPrice = parseToNumb(roundNumber, state.numberOfTeams);

            for (let [index, field] of columnFields.entries()) {
                const fieldVal = parseToNumbOnArg(field.props.value);
                const diff = Math.abs(fieldVal - correctPrice);
                resultList.push([index, diff]);
            }

            console.log("");
            console.log("Correct Price is: ", correctPrice);
            resultList = resultList.sort( (a, b) => {
                return a[1]-b[1];
            })

            let displayTable: any = {};
            for (let i=0; i < state.numberOfTeams; i++) {
                let point = state.numberOfTeams - i;
                let pair = resultList[i];
                let teamName = teamNames[pair[0]];
                let diff = pair[1];
                // console.log(`Team ${teamName} have diff of ${diff} and gets ${point} points.`);
                displayTable[teamName] = {
                    diff: diff,
                    points: point,
                }
            }
            console.table(displayTable);
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

    return (
        <>
        <div style={{ display: "flex", marginTop: "-100px", marginBottom: "50px" }}>

            {/* TODO: lav rows eller lister her ... eller måske faktisk bare et grid så jeg kan have labels i toppen*/}
            {scoreboard}
        </div>
        {/* <table>
            <tr>
                <th>Team</th>
                <th>Diff</th>
                <th>Points</th>
            </tr>
        </table> */}
        </>
    );
}