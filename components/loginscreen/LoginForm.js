import { View, TextInput, StyleSheet, Text, Pressable, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Validator from 'email-validator'
import * as SecureStore from 'expo-secure-store'

import { firebase } from '../../firebase'

const loginFormSchema = Yup.object({
    email: Yup
            .string()
            .email()
            .required('An email is required'),
    password: Yup
            .string()
            .required('A password is required')
            .min(6, 'Password must be at least 6 characters')
})

const tryLogin = async(email,password,saveCredentials) => {
    try {
        await firebase.auth().signInWithEmailAndPassword(email,password)
        // see if we need to save the credentials to storage for next time
        if(saveCredentials) {
            const credentials = {
                email: email,
                password: password
            }
            try {
                await SecureStore.setItemAsync('credentials', JSON.stringify(credentials))
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        Alert.alert('Invalid Entry',error.message)
    }
}

const LoginForm = ({navigation}) => {

  const [saveCredentials, setSaveCredentials] = useState(false)

  const toggleStorage = () => {
    if (saveCredentials) {
        setSaveCredentials(false)
    } else {
        setSaveCredentials(true)
    }
}

  return (
    <View style={styles.wrapper}>
        <Formik
            initialValues={{email: '', password: ''}} 
            validationSchema={loginFormSchema}
            onSubmit={(values) => {
                tryLogin(values.email, values.password, saveCredentials)
            }}
            validateOnMount={true}
        >
             {({
                values, 
                errors, 
                touched,
                isValid, 
                handleChange, 
                handleBlur,
                handleSubmit
            }) => {
            return <>
                <View style={
                    [
                        styles.inputField,
                        {borderColor: values.email.length < 1 || Validator.validate(values.email) ? '#ccc' : 'red'}
                    ]
                }>
                    <TextInput 
                        placeholderTextColor='#444'
                        placeholder='email'
                        autoCapitalize='none'
                        keyboardType='email-address'
                        textContentType='emailAddress'
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                    />
                </View>
                <View style={
                    [
                        styles.inputField,
                        {borderColor: 1 > values.password.length || values.password.length >= 6 ? '#ccc' : 'red'}
                    ]
                }>
                    <TextInput 
                        placeholderTextColor='#444'
                        placeholder='Password'
                        autoCapitalize='none'
                        autoCorrect={false}
                        secureTextEntry={true}
                        textContentType='password'
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                    />
                </View>
                {errors.email && touched.email && (
                    <Text style={{fontsize: 10, color: 'red', marginLeft: 40, marginBottom:15}}>
                        {errors.email}
                    </Text>
                )}
                <View style={{flexDirection: 'row', justifyContent:'space-between',marginHorizontal:10}}>
                    <Pressable style={{alignItems: 'flex-start'}} onPress={toggleStorage}>
                        <Text style={[{ color: saveCredentials ? 'blue' : '#6bb0f5'}, { fontWeight: saveCredentials ? 'bold' : 'normal'}]}>Keep Me Logged In</Text>
                    </Pressable>
                    <View style={{alignItems: 'flex-end'}}>
                        <Text style={{color: '#6bb0f5'}}>Forgot password?</Text>
                    </View>
                </View>
             
                <View style={{marginHorizontal:10,marginTop:20}}>
                    <Pressable style={styles.button(isValid)} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </Pressable>
                </View>
                <View style={styles.signupContainer}>
                    <Text>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.push('SignupScreen')}>
                        <Text style={{color:'#6bb0f5'}}> Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </>
            }}
        </Formik>
    </View>
  )
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop:40
    },
    inputField: {
        borderRadius:4,
        padding:12,
        backgroundColor:'#fafafa',
        marginBottom:10,
        marginHorizontal:10,
        borderWidth:2
    },
    button: isValid => ({
        backgroundColor: isValid ? '#0096f6' : '#9acaf7',
        alignItems:'center',
        justifyContent:'center',
        minHeight:42,
        borderRadius:4
    }),
    buttonText: {
        color:'white',
        fontWeight: '600',
        fontSize: 18
    },
    signupContainer: {
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        marginTop:50
    }
})

export default LoginForm