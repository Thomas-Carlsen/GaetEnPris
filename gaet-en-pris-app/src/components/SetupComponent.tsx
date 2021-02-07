import React from 'react';
import { TextField, ITextFieldStyles, Stack, PrimaryButton } from '@fluentui/react';
import { StateContext } from "../App";

export const SetupComponent  = () => {
    const state = React.useContext(StateContext);
    const stackTokens = { childrenGap: 15 };


    const setupEval = () => {
        state.setIsSetupPhase(false);
    };

    return (
        <div>
            <Stack tokens={stackTokens}>
                <TextField
                    label="Number of Teams"
                    // value={secondTextFieldValue}
                    onChange={(_event, newValue) => state.setNumberOfTeams( newValue ? parseInt(newValue) : 0)}
                    // styles={narrowTextFieldStyles}
                />

                <TextField
                    label="Number of Rounds"
                    // value={secondTextFieldValue}
                    onChange={(_event, newValue) => state.setNumberOfRounds( newValue ? parseInt(newValue) : 0)}
                    // styles={narrowTextFieldStyles}
                />
                <PrimaryButton text="Create Scoreboard" onClick={setupEval} />
            </Stack>
        </div>
    );
}